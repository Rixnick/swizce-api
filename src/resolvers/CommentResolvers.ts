import { Resolver, Query, Mutation, Ctx, Arg } from "type-graphql";
import { Comment, CommentModel } from '../entities/Comment';
import { ScreamModel } from "../entities/Scream";
import { UserModel } from "../entities/User";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";



@Resolver()
export class CommentResolvers {
  @Query(() => [Comment], { nullable: 'items'})
  async comments(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string
  ):Promise<Comment[] | null>{
    try {
      const user = await isAuthenticated(req);

      if (!user) throw new Error("Please Login to Process...!");

      const scream = await ScreamModel.findById(screamId)

      if(!scream) throw new Error("No, Scream authorized...!")

      return CommentModel.find()
        .populate({ path: 'scream', model: ScreamModel})
        .populate({ path: 'user', model: UserModel});

    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Comment)
  async createComment(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string,
    @Arg("description") description: string,
  ): Promise<Comment | undefined | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      const comment = await CommentModel.create({
        description,
        scream: screamId,
        user: userId
      })

      const scream = await ScreamModel.findById(screamId)
      if(!scream.comments){
        scream.comments = [comment];
      }else{
        scream.comments.push(comment)
      }

      await scream.save();

      return CommentModel.findById(comment.id)

    } catch (error) {
      throw error;
    }
  }
}