import * as si from 'simple-icons'

const NEEDED = [
  'Python','FastAPI','Node.js','PostgreSQL','MongoDB','Redis','OpenAI','Claude','Gemini',
  'LangChain','LlamaIndex','Next.js','React','TypeScript','Tailwind CSS','HTML5','CSS3',
  'Supabase','Convex','Cloudflare','Firebase','Docker','Nginx','Vercel','DigitalOcean',
  'Ubuntu','GitHub','Postman','Figma','Resend','VS Code','Notion','RAG','Express','HTML','CSS',
  'Cloudflare R2','Tailwind',
]

const slug = (n) =>
  n.toLowerCase().replace(/\+/g, 'plus').replace(/\./g, 'dot').replace(/[^a-z0-9]/g, '')

const found = [], missing = []
for (const name of NEEDED) {
  const key = 'si' + slug(name).replace(/^./, (c) => c.toUpperCase())
  if (si[key]) found.push(`${name} -> ${key}`)
  else missing.push(name)
}
console.log('FOUND (' + found.length + '):')
found.forEach((f) => console.log('  ' + f))
console.log('\nMISSING (' + missing.length + '):')
missing.forEach((m) => console.log('  ' + m))
