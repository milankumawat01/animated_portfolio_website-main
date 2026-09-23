// apps/web/app/page.tsx — async Server Component, NO 'use client'
import { getProjects, getPosts, getSiteSettings, getExperience, getSkillCategories } from '@/lib/convex'
import { HomeClient } from '@/components/HomeClient'
import { JsonLd, personSchema } from '@/components/seo/JsonLd'

export default async function Home() {
  const [settings, projects, posts, experience, skills] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getPosts(),
    getExperience(),
    getSkillCategories(),
  ])

  return (
    <>
      <JsonLd data={personSchema(settings)} />
      <HomeClient
        settings={settings}
        projects={projects ?? []}
        posts={posts ?? []}
        experience={experience ?? []}
        skills={skills ?? []}
      />
    </>
  )
}
