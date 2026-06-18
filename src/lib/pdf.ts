import { pdf } from '@react-pdf/renderer'
import React from 'react'
import type { ReactElement } from 'react'
import type { TemplateDefinition } from '../templates/types'
import type { PaperMetadata, Question } from '../types/paper'

export function createTemplatePdfDocument(
  template: TemplateDefinition,
  metadata?: Partial<PaperMetadata>,
  questions?: Question[]
): ReactElement {
  const PdfDocument = template.PdfDocument
  return React.createElement(PdfDocument, { metadata, questions }) as ReactElement
}

export async function createPdfBlob(documentElement: ReactElement): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(documentElement as any).toBlob()
  if (!blob) {
    throw new Error('Unable to generate PDF blob')
  }
  return blob
}

export function downloadBlobAsFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
