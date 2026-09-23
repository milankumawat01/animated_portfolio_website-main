'use client'
import { use } from 'react'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { LeadDetail } from '@/components/editor/LeadsInbox'

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <LeadDetail id={id as Id<'leads'>} />
}
