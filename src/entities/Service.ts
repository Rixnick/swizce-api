import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';
import { Typeservice } from './Typeservice';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Service {

  @Field(() => ID)
  id!: string


  @Field()
  @prop({required: true, maxlength: 120})
  name?: string


  @Field()
  @prop({required: true})
  contact?: string


  @Field()
  @prop({required: true})
  address?: string

  @Field()
  @prop({required: true})
  price?: number


  @Field()
  @prop({required: true})
  imageUrl?: string

  @Field()
  @prop({required: true, default: false })
  status?: boolean

  @Field(_type => Typeservice)
  @prop({ ref: typeof Typeservice, required: true})
  typeservices: Ref<Typeservice>


  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const ServiceModel = getModelForClass(Service);