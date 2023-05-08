import { Skolengo } from 'scolengo-api'
import { AbsenceFilesResponse } from 'scolengo-api/types/models/SchoolLife'

export async function getAbsencesFiles (user: Skolengo, studentId: string, limit?: string): Promise<AbsenceFilesResponse> {
  return (await user.getAbsenceFiles(studentId, limit !== undefined ? parseInt(limit, 10) : undefined, 0, {
    fields: {
      absenceFileState: 'creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence',
      absenceReason: 'code,longLabel'
    }
  })).sort((a, b) => new Date(a.currentState.creationDateTime).getTime() - new Date(b.currentState.creationDateTime).getTime())
}
