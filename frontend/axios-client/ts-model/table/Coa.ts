import { User } from '../../ts-model/table/User'

export class Coa {
  id!: number
  code_account!: string
  account!: string
  jenis!: string
  description!: string
  normal_balance!: string
  otm_created_by!: User;
  created_by!: number
}