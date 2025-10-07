import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { User } from '../../model/table/User'

@Entity('Token')
export class Token extends BaseEntity {
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
  token!: string;
  @ManyToOne(() => User, x => x.id, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  otm_id_user!: User;
  @Column({
    name: 'id_user',
    type: 'bigint',
    nullable: false,
  })
  id_user!: number;
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expired_at!: Date;
}