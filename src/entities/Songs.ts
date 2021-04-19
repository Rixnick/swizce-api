import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { Scream } from './Scream';
import { User } from './User';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Song {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true})
  name!: string

  @Field()
  @prop({required: true})
  alblum!: string


  @Field()
  @prop({required: true})
  artist?: string

  @Field()
  @prop({required: true})
  genre?: string


  @Field()
  @prop({required: true})
  imageUrl?: string

  @Field()
  @prop({required: true})
  fileUrl?: string

  @Field(_type => [Scream]) //Scream To front end query
  @prop({ ref: typeof[Scream], required: true }) //
  screams!: Ref<Scream>[];


  //User Can add own song next Development
  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const SongModel = getModelForClass(Song);