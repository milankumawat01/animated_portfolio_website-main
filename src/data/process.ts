export interface BuildStep {
  readonly n: string
  readonly title: string
  readonly description: string
  readonly checklist: readonly string[]
}

export const process: readonly BuildStep[] = [
  {
    n: '01',
    title: 'Understand',
    description: 'I start by understanding the problem, users and business goals.',
    checklist: ['Research', 'User needs', 'Define scope', 'Set milestones'],
  },
  {
    n: '02',
    title: 'Design',
    description: 'I design the architecture, database schema and product flow.',
    checklist: ['System design', 'Database design', 'API structure', 'Scalability planning'],
  },
  {
    n: '03',
    title: 'Build',
    description: 'I write clean, maintainable code and integrate modern AI capabilities.',
    checklist: [
      'Backend development',
      'AI integration',
      'Frontend (if needed)',
      'Testing & iteration',
    ],
  },
  {
    n: '04',
    title: 'Deploy',
    description: 'I deploy, monitor, and optimize for real users in production.',
    checklist: ['Cloud deployment', 'Monitoring & logs', 'Performance tuning', 'Feedback loop'],
  },
  {
    n: '05',
    title: 'Iterate',
    description: 'I learn from real-world usage and keep improving the product.',
    checklist: ['User feedback', 'New features', 'Refactoring', 'Long-term scaling'],
  },
] as const

export const buildScript = {
  filename: 'build.sh',
  badge: 'Small steps. Big products.',
  code: `# turn ideas into products
while (curiosity) {
  learn();
  build();
  ship();
  improve();
}

// better products, brighter tomorrow`,
} as const

export interface Pillar {
  readonly title: string
  readonly sub: string
}

export const pillars: readonly Pillar[] = [
  { title: 'Real Problems', sub: 'User-focused solutions' },
  { title: 'Clean Code', sub: 'Maintainable & scalable' },
  { title: 'Real Users', sub: 'Products used in the real world' },
  { title: 'Continuous Growth', sub: 'Always learning, always building' },
] as const
