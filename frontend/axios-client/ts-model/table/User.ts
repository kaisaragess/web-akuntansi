import { UserType } from '../../ts-model/enum/UserType'

export class User {
  id!: number
  fullname!: string
  username!: string
  password!: string
  role!: UserType
  created_at!: Date
}