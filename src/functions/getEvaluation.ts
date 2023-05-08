import { Skolengo } from 'scolengo-api'
import { Evaluation } from 'scolengo-api/types/models/Results'
import { Period } from 'scolengo-api/types/models/Results/EvaluationSettings'

export async function getEvaluation (user: Skolengo, studentId: string, limit?: string): Promise<Array<Period & { matieres: Evaluation[] }>> {
  const evaluationSettings = await user.getEvaluationSettings(studentId, 100)
  if (evaluationSettings.length === 0) throw new Error('Aucun service d\'évaluation n\'a été trouvé.')
  if (!evaluationSettings[0].evaluationsDetailsAvailable) throw new Error('Le détail des notes n\'est pas disponible.')
  return await Promise.all(evaluationSettings[0].periods.map(async period => ({
    ...period,
    matieres: await user.getEvaluation(studentId, period.id, limit !== undefined ? parseInt(limit, 10) : undefined)
  })))
}
