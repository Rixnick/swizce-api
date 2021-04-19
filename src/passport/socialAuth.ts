import { Response } from 'express';
import { UserModel } from "../entities/User";
import { AppRequest } from "../types";
import { createToken, sendToken } from "../utils/tokenHandler";

const { FRONTEND_URI } = process.env;


export const FBAuthenticate =  async (req: AppRequest, res: Response) => {
  if(!req.userProfile) return

  const { id, emails, displayName, provider} = req.userProfile;

  try {
    //Query User from database as facebookId
    const user = UserModel.findOne({ facebookId: id})
    let token: string 
    if(!user) {
      //New User from facebook login --> Create new user to database
      const newUser = await UserModel.create({ //<Pick<User, 'username' | 'email' | 'facebookId' | 'password'>>
        username: displayName,
        email: emails && emails[0].value || provider,
        facebookId: id,
        password: provider,
      })
      await newUser.save()

      //create token
      token = createToken(newUser.id, newUser.tokenVersion)

      //Send Token to front end
      sendToken(res, token)

      //redirect user to frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`) 
    } else {


       //create token
       token = createToken(user.id, user.tokenVersion)

       //Send Token to front end
       sendToken(res, token)

       //redirect user to frontend --> dashboard
       res.redirect(`${FRONTEND_URI}/dashboard`) 
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}


export const GGAuthenticate =  async (req: AppRequest, res: Response) => {
  if(!req.userProfile) return

  const { id, emails, displayName, provider} = req.userProfile;

  try {
    //Query User from database as facebookId
    const user = UserModel.findOne({ googleId: id})
    let token: string 
    if(!user) {
      //New User from facebook login --> Create new user to database
      const newUser = await UserModel.create({ //<Pick<User, 'username' | 'email' | 'googleId' | 'password'>>
        username: displayName,
        email: emails && emails[0].value || provider,
        googleId: id,
        password: provider,
      })
      await newUser.save()

      //create token
      token = createToken(newUser.id, newUser.tokenVersion)

      //Send Token to front end
      sendToken(res, token)

      //redirect user to frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`) 
    } else {


       //create token
       token = createToken(user.id, user.tokenVersion)

       //Send Token to front end
       sendToken(res, token)

       //redirect user to frontend --> dashboard
       res.redirect(`${FRONTEND_URI}/dashboard`) 
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}