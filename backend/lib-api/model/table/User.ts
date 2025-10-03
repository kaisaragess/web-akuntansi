import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity } from "typeorm";

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
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  role!: string;
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  created_at!: Date;
}