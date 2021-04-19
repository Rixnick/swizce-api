import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Field,
} from "type-graphql"; //Import to tell it is Resolver Func
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto"; //For Create Random String to any token
import { User, UserModel } from "../entities/User";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/authUserValidation";
import { createToken, sendToken } from "../utils/tokenHandler";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import Sendgrid, { MailDataRequired } from "@sendgrid/mail";
import { ProductModel } from "../entities/Products";
import { ScreamModel } from "../entities/Scream";
import { ServiceModel } from "../entities/Service";
import { SongModel } from "../entities/Songs";
import { ProfileModel } from "../entities/Profile";
//import { CurrentModel } from "../entities/Current";

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

@ObjectType()
export class ResponseMessage {
  @Field()
  message!: string;
}


@Resolver()
export class AuthResolvers {
  // Query All Users From Database
  @Query(() => [User], { nullable: "items" })
  async users(@Ctx() { req }: AppContext): Promise<User[] | null> {
    try {
      //Check if User authenticated
      const user = await isAuthenticated(req);

      //Check If User Authorization(Admin Or SuperAdmin)
      const isAuthorized =
        user.roles.includes(RoleOptions.superAdmin) ||
        user.roles.includes(RoleOptions.admin);

      if (!isAuthorized) throw new Error("No Authorization...");

      return UserModel.find()
        .populate({ path: "products", model: ProductModel })
        .populate({ path: "screams", model: ScreamModel })
        .populate({ path: "services", model: ServiceModel })
        .populate({ path: "songs", model: SongModel })
        .sort({ createAt: "desc" }); //
    } catch (error) {
      throw error;
    }
  }

  // Query User From Database
  @Query(() => User, { nullable: true })
  async myInfo(@Ctx() { req }: AppContext): Promise<User | null> {
    try {
      //Check if User authenticated
      const user = await isAuthenticated(req);

      if (!user) throw new Error("Not authenticated...! ");

      const id = user._id;
      // console.log(id)

      const myInfo = await UserModel.findById({ _id: id })
        .populate({
          path: "products",
          model: ProductModel,
        })
        .populate({ path: "screams", model: ScreamModel })
        .populate({ path: "services", model: ServiceModel })
        .populate({ path: "songs", model: SongModel })
        .populate({ path: "products", model: ProductModel })
        .populate({
          path: "profile",
          model: ProfileModel,
          // populate: { path: "current", model: CurrentModel },
        })
        .sort({ createAt: "desc" }); //;

      //console.log(myInfo)

      return myInfo;
    } catch (error) {
      throw error;
    }
  }

  // User Mutation SignUp To database
  @Mutation(() => User, { nullable: true })
  async signUp(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: AppContext //Use Ctx decorator to call express Request, Response(interface)
  ): Promise<User | null> {
    //Promise explicit user or null return
    try {
      //Check username is exist
      if (!username) throw new Error("Username is required...!");
      //Check email is exist
      if (!email) throw new Error("Email is required...!");
      //Check required password
      if (!password) throw new Error("Password is required...!");

      //Check existing username
      const isUsername = await UserModel.findOne({ username });
      if (isUsername)
        throw new Error("Username already used... Please try other!");

      //Query user by email and check already exist
      const user = await UserModel.findOne({ email });
      if (user)
        throw new Error(
          "This email is already in used, plz signin instead...!"
        );

      //Validate Username
      const isUsernameValid = validateUsername(username);
      if (!isUsernameValid)
        throw new Error("Username must be between 3 to 60 charecters");

      //Validate Email
      const isEmailValid = validateEmail(email);
      if (!isEmailValid) throw new Error("Email is invalid...!");

      //Validate Password
      const isPasswordValid = validatePassword(password);
      if (!isPasswordValid)
        throw new Error("Password must be between 6 to 75 Charecter");

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      // create Token
      const token = createToken(newUser.id, newUser.tokenVersion); //Create Token funtion on utils folder
     
      //Send token to frontend
      sendToken(res, token); // if cann't set cookie -> go graphql playground setting request.credential to 'include'

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  //User Mutation signin
  @Mutation(() => User, { nullable: true })
  async signIn(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: AppContext //Use Ctx decorator to call express Request, Response(interface)
  ): Promise<User | null> {
    //Promise explicit user or null return
    try {
      //Check email is exist
      if (!email) throw new Error("Email is required...!");
      //Check required password
      if (!password) throw new Error("Password is required...!");

      //Check if user is exist in database
      const user = await UserModel.findOne({ email });

      if (!user)
        throw new Error("This email not found, plz signup to proceed...!");

      //Check if the password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) throw new Error("Email Or Password is invalid...!");
     
      // create Token
      const token = createToken(user.id, user.tokenVersion); //Create Token funtion on utils folder
      
      //Send token to frontend
      sendToken(res, token); // if cann't set cookie -> go graphql playground setting request.credential to 'include'
      
      //res.setHeader('Set-Cookie', token);



      return user;

    } catch (error) {
      throw error;
    }
  }

  //User Mutation signout
  @Mutation(() => ResponseMessage, { nullable: true })
  async signOut(
    @Ctx() { req, res }: AppContext //Use Ctx decorator to call express Request, Response(interface)
  ): Promise<ResponseMessage | null> {
    //Promise explicit user or null return
    try {
      //Check if user is exist in database
      const user = await UserModel.findById(req.userId);

      if (!user) return null;

      //Bump up token Version
      user.tokenVersion = user.tokenVersion + 1;

      await user.save();

      //clear cookies in the browser
      res.clearCookie(process.env.COOKIE_NAME!);
      return { message: "Goodbye...!" };
    } catch (error) {
      throw error;
    }
  }

  //User Mutation Request to Reset password
  @Mutation(() => ResponseMessage, { nullable: true })
  async requestResetPassword(
    @Arg("email") email: string
  ): Promise<ResponseMessage | null> {
    //Promise explicit user or null return
    try {
      if (!email) throw new Error("Email is required...!");
      //Check if user is exist in database
      const user = await UserModel.findOne({ email: email });

      if (!user) throw new Error("Email not found...!");

      //Create Request Pwd token
      const resetPasswordToken = randomBytes(16).toString("hex");

      const resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30; //30mns expiry

      //Update User in the data
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { resetPasswordToken, resetPasswordTokenExpiry },
        { new: true }
      );

      if (!updatedUser) throw new Error("Sorry, Can not proceed...!");

      //Send Email to User email
      const message: MailDataRequired = {
        from: "admin@me.com",
        to: email,
        subject: "Request password",
        html: `
            <div>
              <p>Please below Link to Reset Your password...!</p>
              <a href='http://localhost:4000/?resetToken=${resetPasswordToken}' target='blank'>Click to Reset Password</a>
            </div>
          `,
      };

      const responseMg = await Sendgrid.send(message);

      if (!responseMg || responseMg[0]?.statusCode !== 2020)
        throw new Error("Sorry, Can not proceed");

      return { message: "Please Check your email to reset password" };
    } catch (error) {
      throw error;
    }
  }

  //User Mutation Reset password
  @Mutation(() => ResponseMessage, { nullable: true })
  async resetPassword(
    @Arg("password") password: string,
    @Arg("token") token: string
  ): Promise<ResponseMessage | null> {
    //Promise explicit user or null return
    try {
      if (!password) throw new Error("Password is required...!");
      if (!token) throw new Error("Sorry, can not proceed...!");

      console.log(token);
      //Check if user is exist in database
      const user = await UserModel.findOne({ resetPasswordToken: token });

      if (!user) throw new Error("Sorry, can not proceed...");

      if (!user.resetPasswordTokenExpiry)
        throw new Error("Sorry, can not proceed...!");

      //Check if token is Valid
      const isTokenValid = Date.now() <= user.resetPasswordTokenExpiry;

      if (!isTokenValid)
        throw new Error("Sorry, can not proceed...! Session expired");

      //Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      //Update User in the data
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordTokenExpiry: undefined,
        },
        { new: true }
      );

      if (!updatedUser) throw new Error("Sorry, Can not proceed...!");

      return { message: "Successfully, Reset password...!" };
    } catch (error) {
      throw error;
    }
  }

  //Mutation Update Roles User
  @Mutation(() => User, { nullable: true })
  async updateRoles(
    @Arg("newRoles", () => [String]) newRoles: RoleOptions[],
    @Arg("userId") userId: string, //User were update roles
    @Ctx() { req }: AppContext //AppContext Super User
  ): Promise<User | null> {
    try {
      //Check if(Admin) Authenticated
      const admin = await isAuthenticated(req);

      //Check if admin is Super User Only
      const isSuperAdmin = admin.roles.includes(RoleOptions.superAdmin);

      if (!isSuperAdmin) throw new Error("Not Authorization...!");

      //Query User to be update from database
      const user = await UserModel.findById(userId);

      if (!user) throw new Error("User not found...!");

      //Found User and Update Roles
      user.roles = newRoles;

      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  //Mutation Update Roles User
  @Mutation(() => ResponseMessage, { nullable: true })
  async deleteUser(
    @Arg("userId") userId: string, //User were update roles
    @Ctx() { req }: AppContext //App Context Super User
  ): Promise<ResponseMessage | null> {
    try {
      //Check if(Admin) Authenticated
      const admin = await isAuthenticated(req);

      //Check if admin is Super User Only
      const isSuperAdmin = admin.roles.includes(RoleOptions.superAdmin);

      if (!isSuperAdmin) throw new Error("Not Authorization...!");

      //Query User to be update from database
      const user = await UserModel.findByIdAndDelete(userId);

      if (!user) throw new Error("Sorry, Can not Proceed...!");

      return { message: `User id: ${userId} has been deleted...!` };
    } catch (error) {
      throw error;
    }
  }
}
