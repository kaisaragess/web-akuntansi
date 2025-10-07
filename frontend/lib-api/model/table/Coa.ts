import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { User } from '../../model/table/User'

@Entity('Coa')
export class Coa extends BaseEntity {
  @Column({
    type: 'bigint',
    nullable: false,
  })
  @PrimaryGeneratedColumn('increment')
  id!: number;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  code_account!: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  account!: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  jenis!: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  description!: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  normal_balance!: string;
  @ManyToOne(() => User, x => x.id, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  otm_created_by!: User;
  @Column({
    name: 'created_by',
    type: 'bigint',
    nullable: false,
  })
  created_by!: number;
}