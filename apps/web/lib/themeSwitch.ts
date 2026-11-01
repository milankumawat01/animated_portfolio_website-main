import { flushSync } from 'react-dom';

export type ThemeName = 'light' | 'dark';

const DURATION = 650;
const EASE_EXPAND = 'cubic-bezier(.4, 0, .2, 1)';
// Collapsing starts at the farthest corner, so a slow start would leave the screen fully
// light for ~300ms; ease-out makes the dark side appear as soon as the button is clicked.
const EASE_COLLAPSE = 'cubic-bezier(.2, 0, 0, 1)';

let running: ViewTransition | null = null;

/**
 * Switches the theme with a circular reveal anchored on the button's centre.
 * Light grows out of the button; dark is uncovered as the light snapshot shrinks back into it.
 * Falls back to an instant switch without the View Transitions API or with reduced motion.
 */
export function switchThemeFrom(buttonEl: HTMLElement | null, nextTheme: ThemeName, apply: () => void) {
  const root = document.documentElement;

  const commit = () => {
    root.dataset.theme = nextTheme;
    // The site's tokens hang off `.dark`; set it now so the new snapshot is correct
    // even before next-themes' own effect runs.
    root.classList.toggle('dark', nextTheme === 'dark');
    root.classList.toggle('light', nextTheme === 'light');
    root.style.colorScheme = nextTheme;
    flushSync(apply);
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!buttonEl || typeof document.startViewTransition !== 'function' || reducedMotion) {
    commit();
    return;
  }

  // A click mid-animation jumps the current switch to its end before starting the next.
  running?.skipTransition();

  // Theme-specific photos may not be decoded yet; if the new snapshot is taken before they
  // are, the reveal uncovers a blank surface where the photo should be.
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[data-theme-image]'));
  Promise.all(images.map((img) => img.decode().catch(() => {}))).then(() => {
    reveal(buttonEl, nextTheme === 'light', commit);
  });
}

function reveal(buttonEl: HTMLElement, expand: boolean, commit: () => void) {
  const root = document.documentElement;
  const rect = buttonEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  root.dataset.themeSwitch = expand ? 'expand' : 'collapse';

  const transition = document.startViewTransition(commit);
  running = transition;
  let animation: Animation | undefined;

  transition.ready
    .then(() => {
      const circles = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      animation = root.animate(
        { clipPath: expand ? circles : [...circles].reverse() },
        {
          duration: DURATION,
          easing: expand ? EASE_EXPAND : EASE_COLLAPSE,
          // Without this the old snapshot flashes back to full size for a frame at the end.
          fill: 'forwards',
          pseudoElement: expand ? '::view-transition-new(root)' : '::view-transition-old(root)',
        },
      );
    })
    .catch(() => {});

  transition.finished.finally(() => {
    // A filled animation outlives the transition and would re-clip the next transition's
    // snapshot of the same name (e.g. old(root) stuck at 0px = blank page), so drop it.
    animation?.cancel();
    if (running === transition) {
      running = null;
      delete root.dataset.themeSwitch;
    }
  });
}
