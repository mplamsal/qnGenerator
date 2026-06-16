import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'
import prisma from './_lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change'

function auth(req: VercelRequest){
  const header = req.headers.authorization as string | undefined
  if(!header) return null
  const token = header.replace('Bearer ', '')
  try{ return jwt.verify(token, JWT_SECRET) as any }catch(e){ return null }
}

export default async function handler(req: VercelRequest, res: VercelResponse){
  const user = auth(req)
  if(!user) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'GET'){
    const teacherId = req.query.teacherId as string | undefined
    if(teacherId){
      const papers = await prisma.questionPaper.findMany({ where: { teacherId }, orderBy: { createdAt: 'desc' }, include: { questions: true } })
      return res.json(papers)
    }
    return res.status(400).json({ error: 'missing teacherId' })
  }

  if(req.method !== 'POST' && req.method !== 'PUT') return res.status(405).end()
  const { metadata, questions, pdfBase64, filename, paperId } = req.body
  try{
    if(req.method === 'POST'){
      const paper = await prisma.questionPaper.create({ data: { teacherId: user.userId, metadataJson: metadata, status: 'Draft' } })
      for(const [idx, q] of (questions || []).entries()){
        await prisma.question.create({ data: { paperId: paper.id, type: q.type, questionText: q.question_text, marks: q.marks, orderIndex: idx } })
      }
      if(pdfBase64){
        const buf = Buffer.from(pdfBase64, 'base64')
        await prisma.paperPdf.create({ data: { paperId: paper.id, filename, data: buf } })
      }
      return res.json({ id: paper.id })
    }

    // PUT -> update existing paper
    if(req.method === 'PUT'){
      if(!paperId) return res.status(400).json({ error: 'paperId required for update' })
      await prisma.question.updateMany({ where: { paperId }, data: {} }) // no-op to ensure table exists
      await prisma.question.deleteMany({ where: { paperId } })
      for(const [idx,q] of (questions || []).entries()){
        await prisma.question.create({ data: { paperId, type: q.type, questionText: q.question_text, marks: q.marks, orderIndex: idx } })
      }
      await prisma.questionPaper.update({ where: { id: paperId }, data: { metadataJson: metadata } })
      if(pdfBase64){
        const buf = Buffer.from(pdfBase64, 'base64')
        await prisma.paperPdf.create({ data: { paperId, filename, data: buf } })
      }
      return res.json({ id: paperId })
    }
  }catch(e:any){
    res.status(500).json({ error: e.message })
  }
}
