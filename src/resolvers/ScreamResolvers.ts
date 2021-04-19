import { Resolver, Query, Mutation, Ctx, Arg } from "type-graphql";
import { CommentModel } from "../entities/Comment";
import { RecommentModel } from "../entities/Recomment";
import { Scream, ScreamModel } from "../entities/Scream";
import { SongModel } from "../entities/Songs";
import { UserModel } from "../entities/User";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";

@Resolver()
export class ScreamResolvers {
  //Query All scream from database
  @Query(() => [Scream], { nullable: "items" })
  async screams(@Ctx() { req }: AppContext): Promise<Scream[] | null> {
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      return ScreamModel.find()
        .populate({ path: "user", model: UserModel })
        .populate({ path: "song", model: SongModel })
        .populate({
          path: "comments",
          model: CommentModel,
          populate:[{
            path: "recomments",
            model: RecommentModel,
            populate: { path: "user", model: UserModel },
          }, 
          { 
            path: "user", 
            model: UserModel 
          },
        ]})

        .sort({ createAt: "desc" });
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Scream)
  async createScream(
    @Ctx() { req }: AppContext,
    @Arg("videoUrl") videoUrl: string,
    @Arg("imageUrl") imageUrl: string,
    @Arg("description") description: string, //MaxLength : 120 characters
    @Arg("likes") likes: number,
    @Arg("shares") shares: number,
    @Arg("songId") songId: string
  ): Promise<Scream | null> {
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      const scream = await ScreamModel.create({
        videoUrl,
        imageUrl,
        description,
        likes,
        shares,
        song: songId,
        user: userId,
      });

      //Find User from database by ID to create cream
      const user = await UserModel.findById(userId);
      if (!user.scream) {
        user.screams = [scream];
      } else {
        user.screams.push(scream);
      }

      //Find User from database by ID to create cream
      const song = await SongModel.findById(songId);
      if (!song.screams) {
        song.screams = [scream];
      } else {
        song.screams.push(scream);
      }

      await user.save();
      await song.save();

      return ScreamModel.findById(scream.id);
    } catch (error) {
      throw error;
    }
  }
}
