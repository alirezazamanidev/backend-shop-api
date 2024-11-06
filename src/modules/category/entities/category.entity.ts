import { BaseEntity } from "src/common/abstracts";
import { EntityNames } from "src/common/enums";
import { Column, Entity, Tree, TreeChildren, TreeParent } from "typeorm";


@Entity(EntityNames.Category)
@Tree('materialized-path')
export class CategoryEntity extends BaseEntity {

    @Column()
    name:string
    @Column({unique:true})
    slug:string
    @TreeChildren()
    children:CategoryEntity[]
    @TreeParent()
    parent:CategoryEntity;;
}