import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { __Type } from 'graphql';
import { User } from './User';
import { Current } from './Current';
import { Hometown } from './Hometown';


@ObjectType({ description: 'Scream Model'}) //Export Objects To type graphql
export class Profile {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true})
  firstname?: string

  @Field()
  @prop({required: true, maxlength: 85})
  lastname?: string

  @Field()
  @prop({required: true, maxlength: 85})
  bios?: string

 
  @Field()
  @prop({required: true})
  gender?: string

  @Field()
  @prop({required: true})
  age?: number

  @Field()
  @prop({required: true})
  birthdate?: Date

  @Field()
  @prop({required: true})
  mentalStatus?: string

  @Field()
  @prop({required: true})
  profileUrl?: string

  @Field()
  @prop({required: true})
  coverUrl?: string


  //Add more Education

  //Add more Occupration

  //Add more current jobs

  //Add more favourite sport

  //Add more favourite music

  //Add more favourite activity

  
  @Field(_type => Current)
  @prop({ ref: typeof Current })
  current: Ref<Current>

  @Field(_type => Hometown)
  @prop({ ref: typeof Hometown })
  hometown: Ref<Hometown>

  @prop({ ref: typeof User, required: true})
  user: Ref<User>
}

export const ProfileModel = getModelForClass(Profile);