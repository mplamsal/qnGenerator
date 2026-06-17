import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'
import prisma from './_lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change'

function auth(req: VercelRequest) {
  const header = req.headers.authorization as string | undefined
  if (!header) return null
  const token = header.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = auth(req)
  const schoolId = user?.schoolId ?? (process.env.NODE_ENV !== 'production' ? (req.query.schoolId as string | undefined) : undefined)
  if (!schoolId) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  if (req.method === 'GET') {
    const templates = await prisma.template.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(templates)
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).end()
  }

  const { templateId, name, description, config } = req.body
  if (!name || !config) {
    return res.status(400).json({ error: 'template name and config are required' })
  }

  try {
    if (req.method === 'POST' && templateId) {
      const updated = await prisma.template.update({
        where: { id: templateId },
        data: { name, description, configJson: config },
      })
      return res.json(updated)
    }

    if (req.method === 'POST') {
      const template = await prisma.template.create({
        data: {
          schoolId,
          name,
          description,
          configJson: config,
        },
      })
      return res.json(template)
    }

    if (req.method === 'PUT') {
      if (!templateId) {
        return res.status(400).json({ error: 'templateId is required for update' })
      }
      const updated = await prisma.template.update({
        where: { id: templateId },
        data: { name, description, configJson: config },
      })
      return res.json(updated)
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
