import type { ComponentType } from 'react'

export type StationId =
  | 'hero'
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'build'
  | 'writing'
  | 'contact'

export type QualityTier = 'low' | 'medium' | 'high'

export interface CameraKeyframe {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
}

export interface SceneManifest {
  /** stable id, matches folder name */
  id: StationId
  /** 1-based display order */
  order: number
  /** scroll range this station occupies, 0..1 of total page progress */
  range: [number, number]
  /** camera keyframe at range start and range end, in world space */
  camera: {
    from: CameraKeyframe
    to: CameraKeyframe
  }
  /** background + fog for this station; SceneDirector cross-fades between them */
  environment: {
    background: string
    fogColor: string
    fogNear: number
    fogFar: number
    theme: 'dark' | 'light'
  }
  /** the R3F subtree. Receives local progress 0..1 within its own range. */
  Scene: ComponentType<SceneProps>
  /**
   * The dynamic import behind `Scene`, when the station is code-split.
   *
   * `SceneDirector` calls this during idle time after first paint so the chunk is
   * already in memory by the time the station mounts. Without it a station's first
   * mount is a network round trip *plus* a shader compile, and both land on the
   * frame the camera arrives — which is exactly the stall this removes.
   */
  preload?: () => Promise<unknown>
  /** mount this station when scroll is within range ± this padding (0..1) */
  mountPadding?: number
  /** hard budgets; DebugHUD flags violations */
  budget: { drawCalls: number; triangles: number }
}

export interface SceneProps {
  /** 0..1 progress within THIS station's range */
  progress: number
  /** true when this station is the active one */
  active: boolean
  /** current quality tier — you MUST branch on this */
  quality: QualityTier
  /** true when the user prefers reduced motion */
  reducedMotion: boolean
}

export const STATION_IDS = [
  'hero',
  'about',
  'projects',
  'experience',
  'skills',
  'build',
  'writing',
  'contact',
] as const satisfies readonly StationId[]

export const DEFAULT_MOUNT_PADDING = 0.08
