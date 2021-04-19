import { config } from "dotenv";
config();
import express from "express";
import apolloServer from "./apolloServer";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";
import { PassportFB, PassportGG } from "./passport";
import { FBAuthenticate, GGAuthenticate } from "./passport/socialAuth";


const {
  APP_PORT,
  DB_URI,
  FB_CALLBACK_ROUTE,
  FRONTEND_URI,
  GG_CALLBACK_ROUTE,
} = process.env;


PassportFB();
PassportGG();

const startServer = async () => {
  try {
    // Create Connection to Database
    await mongoose.connect(`${DB_URI}`, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    // Create Server app
    const app = express();
    //App Middleware
    app.use(cookieParser());

    //Rest Api Route
    //Facebook Login Authentication
    app.get("/auth/facebook", passport.authenticate("facebook"));
    //Facebook Callback Route
    app.get(
      FB_CALLBACK_ROUTE!,
      passport.authenticate("facebook", {
        session: false,
        failureRedirect: FRONTEND_URI,
        scope: ["profile", "email"],
      }),
      FBAuthenticate
    );

    // Google Oauth20
    app.get(
      "/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
      GG_CALLBACK_ROUTE!,
      passport.authenticate("google", {
        session: false,
        failureRedirect: FRONTEND_URI,
      }),
      GGAuthenticate
    );


    
    const Server = await apolloServer();
    Server.applyMiddleware({
      app, 
      // cors: { 
      //   origin: "http://192.168.100.25:3000/", 
      //   credentials: true,
      //   preflightContinue: true,
      //   exposedHeaders: [
      //     "Access-Control-Allow-Header",
      //     "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type",
      //     "X-Password-Expired"
      //   ],
      //   optionsSuccessStatus: 200
      // },
    });
    app.listen({ port: APP_PORT }, () => {
      console.log(
        `Server Started: http://localhost:${APP_PORT}${Server.graphqlPath}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
