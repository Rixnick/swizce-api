import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserModel } from "./entities/User";

//import Resolvers
import { AuthResolvers } from "./resolvers/AuthResolvers";
import { CommentResolvers } from "./resolvers/CommentResolvers";
import { ProdResolvers } from "./resolvers/ProdResolvers";
import { ProfileResolver } from "./resolvers/ProfileResolvers";
import { RecommentResolvers } from "./resolvers/RecommentResolvers";
import { ScreamResolvers } from "./resolvers/ScreamResolvers";
import { ServiceResolvers } from "./resolvers/ServiceResolvers";
import { SongResolvers } from "./resolvers/SongResolvers";
import { TypeserviceResolvers } from "./resolvers/TypeServiceResolvers";
import { AppContext } from "./types";
import { createToken, sendToken, verifyToken } from "./utils/tokenHandler";

export default async () => {
  const schema = await buildSchema({
    //Add More Resolver here
    resolvers: [
      AuthResolvers, 
      ProdResolvers,
      ScreamResolvers,
      SongResolvers,
      TypeserviceResolvers,
      ServiceResolvers,
      ProfileResolver,
      CommentResolvers,
      RecommentResolvers
    ],
    emitSchemaFile: { path: "./src/schema.graphql" },
    validate: false,
  });
  return new ApolloServer({
    schema,
    context: async ({ req, res }: AppContext) => {
      //decode token from cookies
      const token = req.cookies[process.env.COOKIE_NAME!];
      // console.log( 'token',token)

      if (token) {
        try {
          //verify token
          const decodedToken = verifyToken(token) as {
            userId: string;
            tokenVersion: number;
            iat: number;
            exp: number;
          } | null;
          // console.log('Decoded Token', decodedToken)

          if (decodedToken) {
            req.userId = decodedToken.userId;
            req.tokenVersion = decodedToken.tokenVersion;

            //Create Extend Token Time
            if (Date.now() / 1000 - decodedToken.iat > 6 * 60 * 60) { 
              //Query User from database
              const user = await UserModel.findById(req.userId);
              //if found user
              if (user) {
                //Check Token Version is correct
                if (user.tokenVersion === req.tokenVersion) {
                  //update the token version in the user info in the database
                  user.tokenVersion = user.tokenVersion + 1;

                  const updatedUser = await user.save();

                  if (updatedUser) {
                    // create Token
                    const token = createToken( //Create Token funtion on utils folder
                      updatedUser.id, 
                      updatedUser.tokenVersion
                      ); 

                    //Attact Updated Token Version
                    req.tokenVersion = updatedUser.tokenVersion

                    //Send token to frontend
                    sendToken(res, token);
                  }
                }
              }
            }
          }
        } catch (error) {
          req.userId = undefined;
          req.tokenVersion = undefined;
        }
      }

      return { req, res };
    },
  });
};
