import { getModelForClass, prop } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'; //Tell Used To Convert Type from Mongodb Model to Graphql Model
import { RoleOptions } from '../types';
import { Product } from './Products';
import { Scream } from './Scream';
import { Ref } from '../types';
import { Profile } from './Profile';
import { Service } from './Service';
import { Song } from './Songs';
import { Typeservice } from './Typeservice';

@ObjectType({ description: 'User Model'}) //Export Objects To type graphql
export class User {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({required: true, trim: true, lowercase: true})
  username!: string

  @Field() //Query to fontend
  @prop({required: true, trim: true, unique: true, lowercase: true})
  email!: string


  @prop({required: true})
  password!: string


  @prop({ default: 0})
  tokenVersion!: number

  @prop()
  resetPasswordToken?: string

  @prop()
  resetPasswordTokenExpiry?: number

  @prop()
  facebookId?: string

  @prop()
  googleId?: string

  @Field(() => [String])
  @prop({ type: String, enum: RoleOptions, default: [RoleOptions.client]})
  roles!: RoleOptions[]

  @Field()
  @prop({ default: () => Date.now() + 60 * 60 * 1000 * 7})
  createdAt!: Date

  @Field(_type => Profile) //Prop To front end query
  @prop({ ref: typeof Profile }) //
  profile?: Ref<Profile>;


  @Field(_type => [Typeservice]) //Prop To front end query
  @prop({ required: true, ref: typeof [Typeservice]}) //
  typeservices?: Ref<Typeservice>[];

  @Field(_type => [Service]) //Prop To front end query
  @prop({ required: true, ref: typeof [Service]}) //
  services?: Ref<Service>[];

  @Field(_type => [Song]) //Prop To front end query
  @prop({ required: true, ref: typeof [Song]}) //
  songs?: Ref<Song>[];


  @Field(_type => [Product]) //Prop To front end query
  @prop({ required: true, ref: typeof [Product]}) //
  products?: Ref<Product>[];


  @Field(_type => [Scream]) //Scream To front end query
  @prop({ ref: typeof[Scream] }) //
  screams?: Ref<Scream>[];
}

export const UserModel = getModelForClass(User);