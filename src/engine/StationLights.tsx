'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from '@react-three/fiber'
import { Group, type Object3D } from 'three'
import { STATION_ANCHORS } from '@/lib/curves'
import { STATION_IDS, type StationId } from './types'

/**
 * THE LIGHT COUNT MUST NEVER CHANGE. Everything in this file exists for that.
 *
 * three.js puts `numPointLights` — along with the other light counts — into the
 * cache key it builds for EVERY non-raw material, whether or not that material is
 * lit. So the moment the number of *visible* lights in the scene changes, every
 * program in the scene is a cache miss and the renderer relinks all of them, on the
 * main thread, on that frame.
 *
 * Three stations declare two local point lights each. With those lights living
 * inside the station's own group, hiding or unmounting a station changed the count
 * from 3 to 5 to 7 and back, at every boundary — so the site recompiled its entire
 * shader set several times per read-through. That was the multi-second freeze at
 * About, Projects and Contact, and it is why pre-compiling alone did not fix it:
 * the pre-compiled programs were invalidated the instant the next station lit up.
 *
 * A station therefore renders its lights through `<StationLights>`, which portals
 * them into a host group that is created once, parented to the scene once, and
 * never hidden. `Object3D.traverseVisible` — which is how the renderer collects
 * lights — stops descending at an invisible ancestor, so a light inside a hidden
 * station is an invisible light; a light in the host is always counted. The count
 * becomes a constant and the program cache stops thrashing.
 *
 * Each host sits at its station's anchor, so the coordinates a station writes are
 * still station-local and nothing inside a scene has to change. Turning a light off
 * means `intensity = 0`, never unmounting it.
 */

/**
 * The hosts are plain three.js objects built at module scope rather than rendered,
 * so the context has a real target on the very FIRST render of a station. A host
 * that only appeared after a ref callback had fired would mean the lights render
 * inside the station for one commit and move out on the next — which is a light
 * count change, which is the exact thing this file prevents.
 */
const HOSTS: ReadonlyMap<StationId, Group> = new Map(
  STATION_IDS.map((id) => {
    const g = new Group()
    g.name = `station-lights-${id}`
    g.position.fromArray(STATION_ANCHORS[id])
    return [id, g]
  }),
)

/** Parent every host to the scene. Called once, from `SceneDirector`. */
export const attachLightHosts = (scene: Object3D): (() => void) => {
  for (const host of HOSTS.values()) scene.add(host)
  return () => {
    for (const host of HOSTS.values()) scene.remove(host)
  }
}

const HostContext = createContext<StationId | null>(null)

/** `SceneDirector` wraps each station's subtree in this. */
export function StationLightHost({ id, children }: { id: StationId; children: ReactNode }) {
  return <HostContext.Provider value={id}>{children}</HostContext.Provider>
}

/**
 * Renders its children into the enclosing station's light host instead of into the
 * station group. Use it for lights and for nothing else — anything drawable put in
 * here would keep rendering after the station is hidden.
 */
export function StationLights({ children }: { children: ReactNode }) {
  const id = useContext(HostContext)
  const host = id ? HOSTS.get(id) : undefined
  if (!host) return <>{children}</>
  return <>{createPortal(children, host)}</>
}
