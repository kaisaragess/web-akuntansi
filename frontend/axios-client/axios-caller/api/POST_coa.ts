import { COAPayload } from '../../ts-schema/COAPayload'
class POST_coa_Req_Headers {
  authorization!: string
}
class POST_coa_Req_Body {
  data!: COAPayload
}

export class POST_coa_Req {
  headers!: POST_coa_Req_Headers
  body!: POST_coa_Req_Body
}
