import passport from "passport";
import {
  Strategy as FBStrategy,
  StrategyOptionWithRequest as FBStrategyOptionWithRequest,
} from "passport-facebook";
import {
  Strategy as GGStrategy,
  StrategyOptionsWithRequest as GGStrategyOptionWithRequest,
} from "passport-google-oauth20";

import { AppRequest } from "../types";

const { 
  FB_CALLBACK_ROUTE, 
  FB_APP_ID, 
  FB_APP_SECRET,
  GG_CALLBACK_ROUTE,
  GG_APP_ID,
  GG_APP_SECRET, 
  APP_PORT
 } = process.env;


const FBConfig: FBStrategyOptionWithRequest = {
  clientID: FB_APP_ID!,
  clientSecret: FB_APP_SECRET!,
  callbackURL: `http://localhost:${APP_PORT}${FB_CALLBACK_ROUTE}`,
  profileFields: ['id', 'email', 'displayName', 'name'],
  passReqToCallback: true
}

const GGConfig: GGStrategyOptionWithRequest = {
  clientID: GG_APP_ID!,
  clientSecret: GG_APP_SECRET!,
  callbackURL: `http://localhost:${APP_PORT}${GG_CALLBACK_ROUTE}`,
  passReqToCallback: true
}

export const PassportFB = () =>
  passport.use(
    new FBStrategy( FBConfig, (req, _, __, profile, done) => {
      try {
        if(profile) {

          (req as AppRequest).userProfile = profile  //Create Type of user Profile

          done(undefined, profile)
        }
      } catch (error) {
        done(error)
      }
    })
  );

  export const PassportGG = () =>
  passport.use(
    new GGStrategy( GGConfig, (req, _, __, profile, done) => {
      try {
        if(profile) {

          (req as AppRequest).userProfile = profile  //Create Type of user Profile

          done(undefined, profile)
        }
      } catch (error) {
        done(error)
      }
    })
  );