import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { UserType } from '../../model/enum/UserType'

@Entity('User')
export class User extends BaseEntity {
  @Column({
    type: 'bigint',
    nullable: false,
  })
  @PrimaryGeneratedColumn('increment')
  id!: number;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  fullname!: string;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username!: string;
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password!: string;
  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
    default: 'user',
  })
  role!: UserType;
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  created_at!: Date;
}