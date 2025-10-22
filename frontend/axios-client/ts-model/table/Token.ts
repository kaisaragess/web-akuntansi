import { User } from '../../ts-model/table/User'

export class Token {
  id!: number
  token!: string
  otm_id_user!: User;
  id_user!: number
  expired_at!: Date
}