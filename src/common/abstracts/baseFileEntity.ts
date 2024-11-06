import { Column } from "typeorm";
import { BaseEntity } from "./baseEntity";


export abstract class BaseFileEntity extends BaseEntity {

    @Column()
    fieldname:string
    @Column()
    originalname:string
    @Column()
    mimetype:string
    @Column()
    size:number
    @Column()
    path:string
    @Column()
    key:string
}