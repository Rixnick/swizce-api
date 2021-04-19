import { Resolver, Query, Mutation, Ctx, Arg } from "type-graphql";
import { Service, ServiceModel } from '../entities/Service';
import { TypeserviceModel } from "../entities/Typeservice";
import { UserModel } from "../entities/User";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";


@Resolver()
export class ServiceResolvers {
  //Query All service from the database
  @Query(() => [Service], { nullable : 'items'})
  async services(
    @Ctx() {req} : AppContext
  ): Promise<Service[] | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      return ServiceModel.find().populate({ path: 'user', model: UserModel })
    } catch (error) {
      throw error;
    }
  }

  //Create New user Service from requirement
  @Mutation(() => Service)
  async createService(
    @Ctx() { req }: AppContext,
    @Arg("name") name: string,
    @Arg("contact") contact: string,
    @Arg("address") address: string,
    @Arg("price") price: number,
    @Arg("imageUrl") imageUrl: string,
    @Arg("typeserviceId") typeserviceId: string
  ): Promise<Service | undefined | null>{
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      const service = await ServiceModel.create({
        name,
        contact,
        address,
        price,
        imageUrl,
        typeservices: typeserviceId,
        user: userId
      });

      //Find User from the database to add service
      const user = await UserModel.findById(userId);

      if(!user.services) {
        user.services = [service];
      }else{
        user.services.push(service)
      }

      //Find Type service by ID Add
      const typeservice = await TypeserviceModel.findById(typeserviceId)

      if(!typeservice.services) {
        typeservice.services = [service];
      }else{
        typeservice.services.push(service)
      }

      await user.save()
      await typeservice.save()

      return ServiceModel.findById(service.id)
    } catch (error) {
      throw error;
    }
  }
}