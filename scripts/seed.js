const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
require('dotenv').config()

const prisma = new PrismaClient()

async function main(){
  const school = await prisma.school.upsert({ where: { id: '11111111-1111-1111-1111-111111111111' }, update: {}, create: { id: '11111111-1111-1111-1111-111111111111', name: 'Demo School' } })

  const pass = await bcrypt.hash('password123', 10)
  const teacher = await prisma.user.upsert({ where: { email: 'teacher@example.com' }, update: {}, create: { email: 'teacher@example.com', password: pass, name: 'Demo Teacher', role: 'teacher', schoolId: school.id } })
  const admin = await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', password: pass, name: 'Demo Admin', role: 'admin', schoolId: school.id } })

  const template = await prisma.template.upsert({ where: { id: '22222222-2222-2222-2222-222222222222' }, update: {}, create: { id: '22222222-2222-2222-2222-222222222222', schoolId: school.id, name: 'Template A', configJson: { header: 'Demo Header', footer: 'Page {page}' } } })

  console.log('Seeded:', { school: school.id, teacher: teacher.email, admin: admin.email, template: template.name })
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
