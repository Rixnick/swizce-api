import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';
import { Profile } from './Profile';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Hometown {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true, maxlength: 120})
  address?: string


  @Field()
  @prop({required: true})
  city?: string


  @Field()
  @prop({required: true})
  state?: string

  @Field()
  @prop({required: true})
  country?: string


  @Field(_type => Profile)
  @prop({ ref: typeof Profile, required: true})
  profile: Ref<Profile>

  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const HometownModel = getModelForClass(Hometown);