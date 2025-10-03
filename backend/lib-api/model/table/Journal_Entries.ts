import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Journals } from '../../model/table/Journals'
import { Coa } from '../../model/table/Coa'

@Entity('Journal_Entries')
export class Journal_Entries extends BaseEntity {
  @Column({
    type: 'bigint',
    nullable: false,
  })
  @PrimaryGeneratedColumn('increment')
  id!: number;
  @ManyToOne(() => Journals, x => x.id, { nullable: false })
  @JoinColumn({ name: 'id_journal' })
  otm_id_journal!: Journals;
  @Column({
    name: 'id_journal',
    type: 'bigint',
    nullable: false,
  })
  id_journal!: number;
  @ManyToOne(() => Coa, x => x.code_account, { nullable: false })
  @JoinColumn({ name: 'code_coa' })
  otm_code_coa!: Coa;
  @Column({
    name: 'code_coa',
    type: 'varchar',
    nullable: false,
  })
  code_coa!: string;
  @Column({
    type: 'bigint',
    nullable: false,
  })
  debit!: number;
  @Column({
    type: 'bigint',
    nullable: false,
  })
  credit!: number;
}