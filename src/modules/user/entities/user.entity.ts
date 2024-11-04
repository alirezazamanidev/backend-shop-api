import { BaseEntity } from "src/common/abstracts";
import { EntityNames } from "src/common/enums";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {

    @Column({unique:true})
    phone:string
    @Column({unique:true,nullable:true})
    username:string
    @Column({nullable:true})
    fullname:string
    @Column({default:false})
    phone_verify:boolean
    @CreateDateColumn()
    created_at:Date
    @UpdateDateColumn()
    updated_at:Date
}