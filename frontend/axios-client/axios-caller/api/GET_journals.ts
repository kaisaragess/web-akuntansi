class GET_journals_Req_Query {
  limit?: number
  page?: number
  start_date?: string
  end_date?: string
}
class GET_journals_Req_Headers {
  authorization!: string
}

export class GET_journals_Req {
  query!: GET_journals_Req_Query
  headers!: GET_journals_Req_Headers
}
