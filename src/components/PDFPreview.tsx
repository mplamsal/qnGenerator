import React, { useCallback, useState } from 'react'
import { pdfFileName } from '../lib/documentFormat'
import { createPdfBlob, downloadBlobAsFile } from '../lib/pdf'
import type { PaperMetadata, Question } from '../types/paper'
import type { TemplateDefinition } from '../templates/types'

type Props = {
  template: TemplateDefinition
  metadata?: Partial<PaperMetadata>
  questions?: Question[]
}

export default function PDFPreview({ template, metadata = {}, questions = [] }: Props) {
  const [busy, setBusy] = useState(false)
  const PdfDocument = template.PdfDocument

  const handleDownload = useCallback(async () => {
    setBusy(true)
    try {
      const blob = await createPdfBlob(
        <PdfDocument metadata={metadata} questions={questions} />
      )
      downloadBlobAsFile(blob, pdfFileName(metadata))
    } catch (error) {
      console.error(error)
      alert('Failed to generate PDF.')
    } finally {
      setBusy(false)
    }
  }, [metadata, questions, PdfDocument])

  return (
    <button type="button" className="btn btn-primary" disabled={busy} onClick={handleDownload}>
      {busy ? 'Generating…' : 'Download PDF'}
    </button>
  )
}
