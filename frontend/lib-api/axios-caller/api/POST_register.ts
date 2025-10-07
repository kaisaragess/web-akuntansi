class POST_register_Req_Body {
  fullname!: string
  username!: string
  password!: string
  role!: string
}

export class POST_register_Req {
  body!: POST_register_Req_Body
}
