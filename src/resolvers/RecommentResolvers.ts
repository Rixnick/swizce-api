import { Resolver, Query, Mutation, Ctx, Arg } from "type-graphql";
import { CommentModel } from "../entities/Comment";
import { Recomment, RecommentModel } from "../entities/Recomment";
import { ScreamModel } from "../entities/Scream";
import { UserModel } from "../entities/User";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";

@Resolver()
export class RecommentResolvers {
  //Query recomment from scream's comments
  @Query(() => [Recomment], { nullable: "items" })
  async recomments(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string,
    @Arg("commentId") commentId: string
  ): Promise<Recomment[] | null> {
    try {
      const user = await isAuthenticated(req);

      if (!user) throw new Error("Please Login to Process...!");

      const scream = await ScreamModel.findById(screamId);

      if (!scream) throw new Error("No, Scream authorized...!");

      const comment = await CommentModel.findById(commentId);

      if (!comment) throw new Error("No, Comment authorized...!");

      return RecommentModel.find().populate({ path: "user", model: UserModel });
    } catch (error) {
      throw error;
    }
  }

  //Mutation recomment to Scream 's comment
  @Mutation(() => Recomment)
  async createRecomment(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string,
    @Arg("commentId") commentId: string,
    @Arg("description") description: string
  ): Promise<Recomment | null> {
    try {
      //Check if No user Loged in
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      //Check if No Scream
      const scream = await ScreamModel.findById(screamId);

      if (!scream) throw new Error("No, Scream authorized...!");

      const recomment = await RecommentModel.create({
        description,
        user: userId,
      });

      //Check if no comment
      const comment = await CommentModel.findById(commentId);

      if(!comment) throw new Error("No, comment authorized...!")


      if (!comment.recomments) {
        comment.recomments = [recomment];
      } else {
        comment.recomments.push(recomment);
      }

      await comment.save();

      return RecommentModel.findById(recomment.id);
    } catch (error) {
      throw error;
    }
  }
}
