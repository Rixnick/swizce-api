import {Request, Response} from 'express';
import { Profile as FBProfile } from 'passport-facebook';
import { Profile as GGProfile } from 'passport-google-oauth20';

import { ObjectId } from "mongodb";
export type Ref<T> = T | ObjectId;

export enum RoleOptions {
    client = 'CLIENT', 
    itemEditor = 'ITEMEDITOR',
    admin = 'ADMIN',
    superAdmin = 'SUPERADMIN'
}

//Create App Request to extends express request to put userId and tokenVersion
export interface AppRequest extends Request {
    userId?: string
    tokenVersion?:number
    userProfile?: FBProfile | GGProfile //type facebook user Profile 
}


export interface AppContext {
    req: AppRequest; 
    res: Response 
}

