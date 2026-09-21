import type { ComponentType } from 'react'
import type { StationId } from '@/engine/types'
import { Hero } from './Hero'
import { About } from './About'
import { Projects } from './Projects'
import { Experience } from './Experience'
import { Skills } from './Skills'
import { Build } from './Build'
import { Writing } from './Writing'
import { Contact } from './Contact'

/**
 * THE SECTION REGISTRY — written once in P1 and frozen, for the same reason as
 * src/scenes/index.ts. Station agents replace the body of their own file only.
 */
export const sections: readonly { id: StationId; Component: ComponentType }[] = [
  { id: 'hero', Component: Hero },
  { id: 'about', Component: About },
  { id: 'projects', Component: Projects },
  { id: 'experience', Component: Experience },
  { id: 'skills', Component: Skills },
  { id: 'build', Component: Build },
  { id: 'writing', Component: Writing },
  { id: 'contact', Component: Contact },
]
