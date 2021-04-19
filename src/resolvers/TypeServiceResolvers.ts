import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { Typeservice, TypeserviceModel} from '../entities/Typeservice';
import { UserModel } from "../entities/User";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";

@Resolver()
export class TypeserviceResolvers {
  @Query(() => [Typeservice], { nullable: 'items' })
  async typeservices(
    @Ctx() {req} : AppContext,
  ): Promise<Typeservice[] | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      //Check If User Authorization(Admin Or SuperAdmin)
      // const isAuthorized =
      //       userId.roles.includes(RoleOptions.superAdmin) ||
      //       userId.roles.includes(RoleOptions.admin);
    
      // if (!isAuthorized) throw new Error("No Authorization...");

      return TypeserviceModel.find().populate({ path: 'user', model: UserModel})
    } catch (error) {
      throw error;
    }
  }

  //Query Single Typeservice -->TODO:

  @Mutation(() => Typeservice)
  async createTypeservice(
    @Ctx() {req} : AppContext,
    @Arg("desc") desc: string,
    @Arg("imageUrl") imageUrl: string
  ): Promise<Typeservice | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      //Check If User Authorization(Admin Or SuperAdmin)
      const isAuthorized =
            userId.roles.includes(RoleOptions.superAdmin) ||
            userId.roles.includes(RoleOptions.admin);
    
      if (!isAuthorized) throw new Error("No Authorization...");

      const typeservice = await TypeserviceModel.create({
        desc,
        imageUrl,
        user: userId
      })

      const user = await UserModel.findById(userId);

      if(!user.typeservices){
        user.typeservices = [typeservice];
      }else{
        user.typeservices.push(typeservice)
      }

      await user.save()

      return TypeserviceModel.findById(typeservice.id)

    } catch (error) {
      throw error;
    }
  }

  //Mutation update --> TODO:

  //Mutation Delete --> TODO:
}