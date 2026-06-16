import type { PaperMetadata } from '../types/paper'

export function formatExamTitle(metadata: Partial<PaperMetadata>): string {
  const examType = metadata.examType?.trim() || 'Exam'
  const year = metadata.academicYear?.trim() || String(new Date().getFullYear())
  return `${examType} ${year}`
}

export function formatSetLabel(metadata: Partial<PaperMetadata>): string | null {
  if (!metadata.includeSet) return null
  const value = metadata.set?.trim()
  if (!value) return null
  const upper = value.toUpperCase()
  return upper.startsWith('SET') ? upper : `SET ${upper}`
}

export function mcqOptionLabel(index: number): string {
  return String.fromCharCode(97 + index)
}

export function pdfFileName(metadata: Partial<PaperMetadata>): string {
  const subject = metadata.subject?.trim().replace(/\s+/g, '_') || 'exam'
  const year = metadata.academicYear?.trim() || 'paper'
  return `${subject}_${year}.pdf`.toLowerCase()
}
