import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';
import { Recomment } from './Recomment';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Comment {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true, maxlength: 85})
  description?: string


  // @Field()
  // @prop({required: true})
  // videoUrl?: string

  // @Field()
  // @prop({required: true})
  // imageUrl?: string

  @Field(_type => [Recomment])
  @prop({ ref: typeof Recomment, required: true})
  recomments?: Ref<Recomment>[]

  @Field(_type => User)
  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const CommentModel = getModelForClass(Comment);