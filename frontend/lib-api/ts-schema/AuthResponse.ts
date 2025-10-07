import { User } from '../ts-model/table/User'

export class AuthResponse {
  token!: string
  user!: User
}