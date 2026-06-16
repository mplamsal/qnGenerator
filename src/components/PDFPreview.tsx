import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { pdfFileName } from '../lib/documentFormat'
import type { PaperMetadata, Question } from '../types/paper'
import { ExamPdfDocument } from './ExamPdfDocument'

type Props = { metadata?: Partial<PaperMetadata>; questions?: Question[] }

export default function PDFPreview({ metadata = {}, questions = [] }: Props) {
  return (
    <PDFDownloadLink
      document={<ExamPdfDocument metadata={metadata} questions={questions} />}
      fileName={pdfFileName(metadata)}
    >
      {({ loading }) => (
        <button type="button" className="btn btn-primary">
          {loading ? 'Preparing…' : 'Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
