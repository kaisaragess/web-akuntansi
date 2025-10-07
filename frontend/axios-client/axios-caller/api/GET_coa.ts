class GET_coa_Req_Query {
  limit?: number
  page?: number
}
class GET_coa_Req_Headers {
  authorization!: string
}

export class GET_coa_Req {
  query!: GET_coa_Req_Query
  headers!: GET_coa_Req_Headers
}
