import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { formatExamTitle, formatSetLabel, mcqOptionLabel } from '../../lib/documentFormat'
import type { PaperMetadata, Question } from '../../types/paper'

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  headerBox: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoBox: { width: 48, height: 48 },
  titles: {
    alignItems: 'center',
    flex: 1,
  },
  schoolName: { fontSize: 14, fontFamily: 'Times-Bold' },
  examTitle: { fontSize: 12, fontFamily: 'Times-Bold', marginTop: 2 },
  subjectLine: { fontSize: 12, fontFamily: 'Times-Bold', marginTop: 2 },
  headerBottom: {
    flexDirection: 'row',
    marginTop: 6,
  },
  metaLeft: { width: '33%', fontSize: 11 },
  setLine: { width: '34%', fontSize: 12, fontFamily: 'Times-Bold', textAlign: 'center' },
  metaRight: { width: '33%', fontSize: 11, textAlign: 'right' },
  instructions: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Times-BoldItalic',
  },
  questionBlock: { marginBottom: 8 },
  questionLine: { flexDirection: 'row', marginBottom: 2 },
  questionText: { flex: 1, fontFamily: 'Times-Bold' },
  questionMarks: { marginLeft: 4, fontStyle: 'italic', fontFamily: 'Times-Roman' },
  subList: { marginLeft: 18, marginTop: 2 },
  subRow2col: { flexDirection: 'row', marginBottom: 1 },
  subItem: { flexDirection: 'row', marginBottom: 1 },
  subItemHalf: { flex: 1, flexDirection: 'row', marginBottom: 1 },
  subBullet: { width: 18 },
  subText: { flex: 1 },
  mcqList: { marginLeft: 18, marginTop: 2 },
  mcqOption: { flexDirection: 'row', marginBottom: 1 },
  mcqBullet: { width: 18 },
  mcqText: { flex: 1 },
})

function marksLabel(q: Question): string {
  return q.marks_expression ? `[${q.marks_expression}]` : q.marks ? `[${q.marks}]` : ''
}

export function ExamPdfDocument({ metadata = {}, questions = [] }: { metadata?: Partial<PaperMetadata>; questions?: Question[] }) {
  const setLabel = formatSetLabel(metadata)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBox}>
          <View style={styles.headerTop}>
            <View style={styles.logoBox}>
              <Image src="/school-logo.png" style={{ width: 48, height: 48 }} />
            </View>
            <View style={styles.titles}>
              <Text style={styles.schoolName}>{metadata.schoolName || 'SOS Hermann Gmeiner School Sanothimi'}</Text>
              <Text style={styles.examTitle}>{formatExamTitle(metadata)}</Text>
              <Text style={styles.subjectLine}>Subject: {metadata.subject || 'Mathematics'}</Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.metaLeft}>
              <Text>Class: {metadata.grade || '—'}</Text>
              <Text>Time: {metadata.duration || '—'}</Text>
            </View>
            <Text style={styles.setLine}>{setLabel || ''}</Text>
            <View style={styles.metaRight}>
              <Text>F.M. = {metadata.fullMarks || '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.instructions}>Attempt all the questions.</Text>

        <View>
          {questions.map((q, idx) => {
            const ml = marksLabel(q)
            const subQs = q.sub_questions ?? []
            const is2col = q.sub_questions_layout === '2col'
            return (
              <View key={q.id || idx} style={styles.questionBlock}>
                <View style={styles.questionLine}>
                  <Text style={styles.questionText}>{idx + 1}. {q.question_text || '…'}</Text>
                  {ml ? <Text style={styles.questionMarks}>{ml}</Text> : null}
                </View>

                {subQs.length > 0 && (
                  <View style={styles.subList}>
                    {is2col ? (
                      Array.from({ length: Math.ceil(subQs.length / 2) }).map((_, ri) => {
                        const left = subQs[ri * 2]
                        const right = subQs[ri * 2 + 1]
                        return (
                          <View key={ri} style={styles.subRow2col}>
                            <View style={styles.subItemHalf}>
                              <Text style={styles.subBullet}>({String.fromCharCode(97 + ri * 2)})</Text>
                              <Text style={styles.subText}>{left?.text || '………………'}</Text>
                            </View>
                            {right ? (
                              <View style={styles.subItemHalf}>
                                <Text style={styles.subBullet}>({String.fromCharCode(97 + ri * 2 + 1)})</Text>
                                <Text style={styles.subText}>{right.text || '………………'}</Text>
                              </View>
                            ) : <View style={styles.subItemHalf} />}
                          </View>
                        )
                      })
                    ) : (
                      subQs.map((sq, si) => (
                        <View key={sq.id || si} style={styles.subItem}>
                          <Text style={styles.subBullet}>({String.fromCharCode(97 + si)})</Text>
                          <Text style={styles.subText}>{sq.text || '………………'}</Text>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {q.type === 'MCQ' && q.options && q.options.length > 0 && (
                  <View style={styles.mcqList}>
                    {q.options.map((opt, oi) =>
                      opt.trim() || q.options!.length <= 4 ? (
                        <View key={oi} style={styles.mcqOption}>
                          <Text style={styles.mcqBullet}>({mcqOptionLabel(oi)})</Text>
                          <Text style={styles.mcqText}>{opt || '………………'}</Text>
                        </View>
                      ) : null
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
