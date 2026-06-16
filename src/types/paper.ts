import { v4 as uuidv4 } from 'uuid'

export type QuestionType = 'MCQ' | 'Very Short' | 'Short' | 'Long'

export type Question = {
  id: string
  type: QuestionType
  question_text: string
  marks: number
  options?: string[]
}

export type PaperMetadata = {
  subject: string
  grade: string
  examType: string
  duration: string
  fullMarks: string
  academicYear: string
  schoolName: string
  includeSet?: boolean
  set?: string
}

export const DEFAULT_MCQ_OPTIONS = ['', '', '', '']

export const DEFAULT_METADATA: PaperMetadata = {
  subject: '',
  grade: '',
  examType: '',
  duration: '',
  fullMarks: '',
  academicYear: '',
  schoolName: 'SOS Hermann Gmeiner School, Sanothimi Bhaktapur',
  includeSet: false,
  set: '',
}

export function defaultMarks(type: QuestionType): number {
  if (type === 'MCQ' || type === 'Very Short') return 1
  if (type === 'Short') return 5
  return 10
}

export function createQuestion(type: QuestionType = 'MCQ'): Question {
  const q: Question = {
    id: uuidv4(),
    type,
    question_text: '',
    marks: defaultMarks(type),
  }
  if (type === 'MCQ') q.options = [...DEFAULT_MCQ_OPTIONS]
  return q
}

export function ensureMcqOptions(q: Question): Question {
  if (q.type !== 'MCQ') return q
  if (q.options && q.options.length >= 4) return q
  return { ...q, options: [...DEFAULT_MCQ_OPTIONS] }
}
