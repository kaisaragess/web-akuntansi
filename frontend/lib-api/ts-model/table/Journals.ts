import { User } from '../../ts-model/table/User'

export class Journals {
  id!: number
  otm_id_user!: User;
  id_user!: number
  date!: Date
  description?: string
  referensi?: string
  lampiran?: string
  nomor_bukti!: string
}