import { Entry } from '../ts-schema/Entry'

export class JournalRes {
  id!: string
  id_user!: string
  date!: string
  description?: string
  nomor_bukti!: string
  lampiran?: string
  referensi?: string
  entries!: Entry[]
}