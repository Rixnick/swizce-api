import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { Song, SongModel} from '../entities/Songs';
import { UserModel } from "../entities/User";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";

@Resolver()
export class SongResolvers {
  @Query(() => [Song], { nullable: 'items'})
  async songs(
    @Ctx() {req} : AppContext,
  ): Promise<Song[] | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

        //Check If User Authorization(Admin Or SuperAdmin)
        const isAuthorized =
            userId.roles.includes(RoleOptions.superAdmin) ||
            userId.roles.includes(RoleOptions.admin);
    
        if (!isAuthorized) throw new Error("No Authorization...");

        return SongModel.find().populate({ path: 'user', model: UserModel})
    } catch (error) {
      throw error;
    }
  }

  //Query Single Song to views scream --> TODO:

  //Create Song 
  @Mutation(() => Song)
  async createSong(
    @Ctx() {req} : AppContext,
    @Arg("name") name: string,
    @Arg("alblum") alblum: string,
    @Arg("artist") artist: string,
    @Arg("genre") genre: string,
    @Arg("imageUrl") imageUrl: string,
    @Arg("fileUrl") fileUrl: string
  ): Promise<Song | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      //Check If User Authorization(Admin Or SuperAdmin)
      const isAuthorized =
            userId.roles.includes(RoleOptions.superAdmin) ||
            userId.roles.includes(RoleOptions.admin);
    
      if (!isAuthorized) throw new Error("No Authorization...");

      const song = await SongModel.create({
        name,
        alblum,
        artist,
        genre,
        imageUrl,
        fileUrl,
        user: userId
      });
      
      const user = await UserModel.findById(userId);

      if(!user.songs) {
        user.songs = [song];
      }else{
        user.songs.push(song)
      }

      await user.save();

      return SongModel.findById(song.id)

    } catch (error) {
      throw error;
    }
  }

  //Mutation Update Song Info


  //Mutation Delete Song
}