import { Entry } from '../../ts-schema/Entry'
class POST_journals_Req_Headers {
  authorization!: string
}
class POST_journals_Req_Body {
  date!: string
  description?: string
  lampiran?: string
  referensi?: string
  entries!: Entry[]
}

export class POST_journals_Req {
  headers!: POST_journals_Req_Headers
  body!: POST_journals_Req_Body
}
