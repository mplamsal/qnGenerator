import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'
import prisma from './_lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name, schoolId, role } = req.body
  if(!email || !password) return res.status(400).json({ error: 'email and password required' })
  const hashed = await bcrypt.hash(password, 10)
  try{
    const user = await prisma.user.create({ data: { email, password: hashed, name, role, schoolId } })
    res.json({ id: user.id, email: user.email })
  }catch(e:any){
    res.status(500).json({ error: e.message })
  }
}
