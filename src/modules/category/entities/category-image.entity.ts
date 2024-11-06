import { BaseFileEntity } from "src/common/abstracts";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { CategoryEntity } from "./category.entity";
import { EntityNames } from "src/common/enums";

@Entity(EntityNames.CategoryImage)
export class CategoryImageEntity extends BaseFileEntity {
    @Column()
    categoryId:number
    @OneToOne(()=>CategoryEntity,category=>category.image,{onDelete:'CASCADE'})
    @JoinColumn({name:'categoryId'})
    category:CategoryEntity
}