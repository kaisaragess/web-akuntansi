import { Entry } from '../../ts-schema/Entry'
class PUT_journals__id_Req_Paths {
  id!: number
}
class PUT_journals__id_Req_Headers {
  authorization!: string
}
class PUT_journals__id_Req_Body {
  date!: string
  description?: string
  lampiran?: string
  referensi?: string
  entries!: Entry[]
}

export class PUT_journals__id_Req {
  paths!: PUT_journals__id_Req_Paths
  headers!: PUT_journals__id_Req_Headers
  body!: PUT_journals__id_Req_Body
}
