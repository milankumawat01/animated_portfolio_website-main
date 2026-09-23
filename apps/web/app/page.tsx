// apps/web/app/page.tsx — async Server Component, NO 'use client'
import { getProjects, getPosts, getSiteSettings, getExperience, getSkillCategories } from '@/lib/convex'
import { HomeClient } from '@/components/HomeClient'

export default async function Home() {
  const [settings, projects, posts, experience, skills] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getPosts(),
    getExperience(),
    getSkillCategories(),
  ])

  return (
    <HomeClient
      settings={settings}
      projects={projects ?? []}
      posts={posts ?? []}
      experience={experience ?? []}
      skills={skills ?? []}
    />
  )
}
