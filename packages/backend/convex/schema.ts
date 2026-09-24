import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,

  projects: defineTable({
    slug:            v.string(),
    legacyId:        v.optional(v.string()),
    title:           v.string(),
    subtitle:        v.string(),
    description:     v.string(),
    longDescription: v.string(),
    imageStorageId:  v.optional(v.id('_storage')),
    imageUrl:        v.optional(v.string()),
    galleryUrls:     v.optional(v.array(v.string())),
    caseStudyUrl:    v.optional(v.string()),
    tags:            v.array(v.string()),
    keyFeatures:     v.array(v.string()),
    architecture:    v.array(v.string()),
    stats:           v.array(v.object({ label: v.string(), value: v.string() })),
    liveUrl:         v.optional(v.string()),
    githubUrl:       v.optional(v.string()),
    status:          v.union(v.literal('draft'), v.literal('published'), v.literal('archived')),
    featured:        v.boolean(),
    order:           v.number(),
    seo:             v.optional(v.object({
                       title:       v.optional(v.string()),
                       description: v.optional(v.string()),
                     })),
    publishedAt:     v.optional(v.number()),
    updatedAt:       v.number(),
  })
    .index('by_slug',            ['slug'])
    .index('by_status_order',    ['status', 'order'])
    .index('by_status_featured', ['status', 'featured']),

  blogPosts: defineTable({
    slug:            v.string(),
    legacyId:        v.optional(v.string()),
    title:           v.string(),
    excerpt:         v.string(),
    body:            v.string(),
    imageStorageId:  v.optional(v.id('_storage')),
    imageUrl:        v.optional(v.string()),
    category:        v.optional(v.string()),
    tags:            v.array(v.string()),
    readTimeMinutes: v.number(),
    status:          v.union(v.literal('draft'), v.literal('published'), v.literal('scheduled'), v.literal('archived')),
    scheduledAt:     v.optional(v.number()),
    featured:        v.boolean(),
    views:           v.number(),
    seo:             v.optional(v.object({
                       title:       v.optional(v.string()),
                       description: v.optional(v.string()),
                     })),
    publishedAt:     v.optional(v.number()),
    updatedAt:       v.number(),
  })
    .index('by_slug',               ['slug'])
    .index('by_status_publishedAt', ['status', 'publishedAt']),

  leads: defineTable({
    name:      v.string(),
    email:     v.string(),
    message:   v.string(),
    subject:   v.optional(v.string()),
    phone:     v.optional(v.string()),
    company:   v.optional(v.string()),
    source:    v.union(v.literal('contact-modal'), v.literal('contact-page'), v.literal('admin')),
    status:    v.union(
                 v.literal('new'), v.literal('read'),
                 v.literal('replied'), v.literal('archived'),
                 v.literal('contacted'), v.literal('in_discussion'),
                 v.literal('converted'), v.literal('closed'),
               ),
    meta:      v.object({
                 userAgent: v.optional(v.string()),
                 referrer:  v.optional(v.string()),
                 path:      v.optional(v.string()),
               }),
    notes:     v.optional(v.string()),
    lastContactAt: v.optional(v.number()),
    notified:  v.boolean(),
    repliedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_status_createdAt', ['status', 'createdAt'])
    .index('by_createdAt',        ['createdAt'])
    .index('by_email',            ['email']),

  leadEvents: defineTable({
    leadId: v.id('leads'),
    kind: v.union(v.literal('created'), v.literal('status'), v.literal('note')),
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index('by_lead_createdAt', ['leadId', 'createdAt']),

  rateLimits: defineTable({
    key:         v.string(),
    count:       v.number(),
    windowStart: v.number(),
  }).index('by_key', ['key']),

  experience: defineTable({
    legacyId:  v.optional(v.string()),
    company:   v.string(),
    role:      v.string(),
    period:    v.string(),
    employmentType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    current: v.optional(v.boolean()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    timeframe: v.string(),
    badge:     v.string(),
    logo:      v.string(),
    logoBg:    v.string(),
    points:    v.array(v.string()),
    tags:      v.array(v.string()),
    order:     v.number(),
    visible:   v.boolean(),
    updatedAt: v.number(),
  }).index('by_visible_order', ['visible', 'order']),

  skillCategories: defineTable({
    title:     v.string(),
    subtitle:  v.string(),
    icon:      v.string(),
    skills:    v.array(v.object({ name: v.string(), iconKey: v.string(), visible: v.optional(v.boolean()) })),
    order:     v.number(),
    visible:   v.boolean(),
    updatedAt: v.number(),
  }).index('by_visible_order', ['visible', 'order']),

  siteSettings: defineTable({
    key: v.literal('main'),

    personal: v.object({
      name: v.string(), role: v.string(), location: v.string(),
      headline: v.string(), subheadline: v.string(),
      email: v.string(), bio: v.string(),
      linkedin: v.string(), linkedinUrl: v.string(),
      github: v.string(),   githubUrl: v.string(),
      twitterUrl: v.string(), resumeUrl: v.string(),
    }),

    stats:         v.array(v.object({ value: v.string(), label: v.string() })),
    heroTechStack: v.array(v.object({ name: v.string(), iconKey: v.string() })),
    aboutPillars:  v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() })),
    whatIWorkOn:   v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() })),

    quotes: v.object({
      about: v.string(), skills: v.string(), howIBuild: v.string(),
      experience: v.string(), writing: v.string(), contact: v.string(),
    }),

    handwriting: v.object({
      aboutPhoto: v.string(), aboutBottom: v.string(), projects: v.string(),
      skillsPhoto: v.string(), skillsBottom: v.string(),
      experienceLeft: v.string(), experienceRight: v.string(),
      howIBuildTop: v.string(), howIBuildBottom: v.string(),
      writingTop: v.string(), contactTop: v.string(), footer: v.string(),
    }),

    howIBuildSteps: v.array(v.object({
      step: v.string(), title: v.string(), icon: v.string(),
      description: v.string(), items: v.array(v.string()),
    })),
    howIBuildPillars: v.array(v.object({
      title: v.string(), subtitle: v.string(), icon: v.string(),
    })),
    contactCards: v.array(v.object({
      id: v.string(), title: v.string(), value: v.string(), hint: v.string(),
      icon: v.string(), action: v.string(), copyable: v.boolean(),
    })),

    updatedAt: v.number(),
  }).index('by_key', ['key']),

  media: defineTable({
    // New uploads go to R2 (r2Key); storageId is kept for rows uploaded to Convex storage before.
    storageId:   v.optional(v.id('_storage')),
    r2Key:       v.optional(v.string()),
    filename:    v.string(),
    contentType: v.string(),
    size:        v.number(),
    alt:         v.string(),
    caption:     v.optional(v.string()),
    collection:  v.optional(v.string()),
    width:       v.optional(v.number()),
    height:      v.optional(v.number()),
    uploadedAt:  v.number(),
  }).index('by_uploadedAt', ['uploadedAt']),
})
