import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from './_lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ error: 'email and password required' })
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user) return res.status(401).json({ error: 'invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(401).json({ error: 'invalid credentials' })
  const token = jwt.sign({ userId: user.id, role: user.role, schoolId: user.schoolId }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token })
}
