import React from 'react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 12, fontFamily: 'Times-Roman' },
  headerBox: { borderWidth: 1, borderColor: '#000', padding: 8, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoBox: { width: 40, height: 40, backgroundColor: '#0ea5e9', borderRadius: 4 },
  spacer: { width: 40 },
  titles: { alignItems: 'center', flex: 1 },
  schoolName: { fontSize: 14, fontWeight: 700 },
  examTitle: { fontSize: 12, fontWeight: 700 },
  subjectLine: { fontSize: 12, fontWeight: 700 },
  headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  metaLeft: { fontSize: 11 },
  setLine: { fontSize: 12, fontWeight: 700 },
  metaRight: { fontSize: 11, textAlign: 'right' },
  instructions: { fontStyle: 'italic', textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  question: { marginBottom: 6 }
})

type Props = { metadata?: any, questions?: any[] }

export default function PDFPreview({ metadata, questions }: Props){
  const MyDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBox}>
          <View style={styles.headerTop}>
            <View style={styles.logoBox} />
            <View style={styles.titles}>
              <Text style={styles.schoolName}>{metadata?.schoolName || 'SOS Hermann Gmeiner School Sanothimi'}</Text>
              <Text style={styles.examTitle}>First Unit Test 2026</Text>
              <Text style={styles.subjectLine}>Subject: {metadata?.subject || 'Mathematics'}</Text>
            </View>
            <View style={styles.spacer} />
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.metaLeft}>
              <Text>Class: {metadata?.grade || 'V'}</Text>
              <Text>Time: {metadata?.duration || '40 minutes'}</Text>
            </View>
            <Text style={styles.setLine}>SET A</Text>
            <View style={styles.metaRight}>
              <Text>F.M. = {metadata?.fullMarks || '20'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.instructions}>Attempt all the questions.</Text>

        <View>
          {(questions || []).map((q, idx) => (
            <View key={idx} style={styles.question}>
              <Text>{idx+1}. {q.question_text} {q.marks ? `(${q.marks} marks)` : ''}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )

  return (
    <div>
      <PDFDownloadLink document={<MyDoc/>} fileName="paper.pdf">
        {({loading}) => <button className="btn btn-primary">{loading? 'Preparing...' : 'Download PDF'}</button>}
      </PDFDownloadLink>
    </div>
  )
}
