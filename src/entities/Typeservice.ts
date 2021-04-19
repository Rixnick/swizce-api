import { getModelForClass, prop } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { Ref } from '../types';
import { Service } from './Service';
import { User } from './User';
// import { __Type } from 'graphql';

@ObjectType({ description: 'User Model'}) //Export Objects To type graphql
export class Typeservice {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({ required: true })
  desc!: string


  @Field()
  @prop({ required: true })
  imageUrl!: string 

  @Field(_type => [Service]) //Scream To front end query
  @prop({ ref: typeof[Service] }) //
  services?: Ref<Service>[];

  @Field()
  @prop({ default: () => Date.now() + 60 * 60 * 1000 * 7})
  createdAt!: Date 

  //User Can add own song next Development
  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user?: Ref<User>

}

export const TypeserviceModel = getModelForClass(Typeservice);