import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';
import { Song } from './Songs';
import { Comment } from './Comment';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Scream {
  @Field(() => ID)
  id!: string

  @Field(_type => [String])
  @prop({type: () => [String]})
  videoUrl?: [string];

  @Field(_type => [String])
  @prop({type: () => [String]})
  imageUrl?: [string];

  @Field()
  @prop({required: true, maxlength: 120})
  description?: string


  @Field(_type => [Comment])
  @prop({required: true, ref: typeof [Comment]})
  comments?: Ref<Comment>[]

  @Field()
  @prop({required: true})
  likes?: number

  @Field()
  @prop({required: true})
  shares?: number

  @Field(_type => Song)
  @prop({ ref: typeof Song, required: true})
  song: Ref<Song>

  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const ScreamModel = getModelForClass(Scream);