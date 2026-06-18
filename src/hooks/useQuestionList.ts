import { useState, useCallback } from 'react'
import { createQuestion } from '../types/paper'
import type { Question } from '../types/paper'

export function useQuestionList(initial: Question[] = []) {
  const [questions, setQuestions] = useState<Question[]>(initial)

  const addQuestion = useCallback((type: Question['type'] = 'MCQ') => {
    setQuestions((qs) => [...qs, createQuestion(type)])
  }, [])

  const removeQuestion = useCallback((id: string) => {
    setQuestions((qs) => {
      if (qs.length <= 1) { alert('Must have at least one question.'); return qs }
      return qs.filter((q) => q.id !== id)
    })
  }, [])

  const updateQuestion = useCallback((updated: Question) => {
    setQuestions((qs) => qs.map((q) => (q.id === updated.id ? updated : q)))
  }, [])

  const moveUp = useCallback((index: number) => {
    setQuestions((items) => {
      if (index <= 0) return items
      const copy = [...items]
      ;[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]
      return copy
    })
  }, [])

  const moveDown = useCallback((index: number) => {
    setQuestions((items) => {
      if (index >= items.length - 1) return items
      const copy = [...items]
      ;[copy[index], copy[index + 1]] = [copy[index + 1], copy[index]]
      return copy
    })
  }, [])

  return { questions, setQuestions, addQuestion, removeQuestion, updateQuestion, moveUp, moveDown }
}
