import { Journals } from '../../ts-model/table/Journals'
import { Coa } from '../../ts-model/table/Coa'

export class Journal_Entries {
  id!: number
  otm_id_journal!: Journals;
  id_journal!: number
  otm_code_coa!: Coa;
  code_coa!: string
  debit!: number
  credit!: number
}