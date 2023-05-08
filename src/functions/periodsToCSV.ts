import { Evaluation } from 'scolengo-api/types/models/Results'
import { Period } from 'scolengo-api/types/models/Results/EvaluationSettings'

export function periodsToCSV (periods: Array<Period & { matieres: Evaluation[] }>): string {
  const CSV_HEADERS = 'period,subject,dateTime,coefficient,scale,mark\n'
  return CSV_HEADERS + periods.map(p =>
    p.matieres.map(m =>
      m.evaluations.map(e =>
        [p.label, m.subject.label, e.dateTime, Math.round(e.coefficient * 100) / 100, e.scale, e.evaluationResult.mark ?? e.evaluationResult.nonEvaluationReason]
      )
    )).flat(2)
    .map(e => e.join(','))
    .join('\n')
}
