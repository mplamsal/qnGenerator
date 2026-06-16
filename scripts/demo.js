const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change'

async function main(){
  // login as teacher
  const user = await prisma.user.findUnique({ where: { email: 'teacher@example.com' } })
  if(!user) throw new Error('Teacher user not found')
  const ok = await bcrypt.compare('password123', user.password)
  if(!ok) throw new Error('Password mismatch')
  const token = jwt.sign({ userId: user.id, role: user.role, schoolId: user.schoolId }, JWT_SECRET, { expiresIn: '8h' })
  console.log('Logged in as', user.email, 'token:', token.slice(0,20)+'...')

  // create a paper with questions
  const paper = await prisma.questionPaper.create({ data: { teacherId: user.id, metadataJson: { subject: 'Mathematics', grade: 'IV', examType: 'Unit Test', duration: '40 minutes', fullMarks: '20', academicYear: '2026' }, status: 'Draft' } })
  const questions = [ { type: 'MCQ', question_text: 'Sample MCQ', marks: 2 }, { type: 'Short', question_text: 'Sample Short', marks: 5 } ]
  for(const [i,q] of questions.entries()){
    await prisma.question.create({ data: { paperId: paper.id, type: q.type, questionText: q.question_text, marks: q.marks, orderIndex: i } })
  }

  // store a dummy PDF blob
  const buf = Buffer.from('PDF-DUMMY-CONTENT')
  await prisma.paperPdf.create({ data: { paperId: paper.id, filename: 'demo.pdf', data: buf } })

  console.log('Created paper', paper.id)
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
