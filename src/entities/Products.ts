import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';


@ObjectType({ description: 'Product Model'}) //Export Objects To type graphql
export class Product {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true})
  name!: string

  @Field()
  @prop({required: true})
  description?: string

  @Field()
  @prop({required: true})
  color?: string


  @Field()
  @prop({required: true})
  size?: number

  @Field()
  @prop({required: true})
  price!: number

  @Field()
  @prop({required: true})
  quantity!: number

  @Field()
  @prop({ required: true })
  imageUrl!: string


  @Field()
  @prop({ default: () => Date.now() + 60 * 60 * 1000 * 7})
  createdAt!: Date

  
  @Field(_type => User)
  @prop({ required: true, ref: typeof User}) // { ref: typeof User, required: true }
  user: Ref<User>
}

export const ProductModel = getModelForClass(Product);