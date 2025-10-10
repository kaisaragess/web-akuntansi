import { Entry } from '../ts-schema/Entry'

export class JournalRes {
  id!: number
  id_user!: number
  date!: string
  description?: string
  nomor_bukti!: string
  lampiran?: string
  referensi?: string
  entries!: Entry[]
}