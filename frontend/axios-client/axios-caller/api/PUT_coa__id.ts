import { COAPayload } from '../../ts-schema/COAPayload'
class PUT_coa__id_Req_Paths {
  id!: number
}
class PUT_coa__id_Req_Headers {
  authorization!: string
}
class PUT_coa__id_Req_Body {
  data!: COAPayload
}

export class PUT_coa__id_Req {
  paths!: PUT_coa__id_Req_Paths
  headers!: PUT_coa__id_Req_Headers
  body!: PUT_coa__id_Req_Body
}
