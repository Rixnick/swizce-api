import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { Product, ProductModel } from "../entities/Products";
import { UserModel } from "../entities/User";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";


// Basic Product Ops
@Resolver()
export class ProdResolvers {
  // Query All Products From Database
  @Query(() => [Product], { nullable: "items" })
  async products(
    @Ctx() {req} : AppContext, 
  ): Promise<Product[] | null> {
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      return ProductModel.find().populate({ path: "user", model: UserModel });
    } catch (error) {
      throw error;
    }
  }

  // Query Products by ID From Database
  @Query(() => Product, { nullable: true })
  async product(
    @Ctx() {req} : AppContext, 
    @Arg("productId") productId: string
  ): Promise<Product | undefined | null> {
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      const product = await ProductModel.findById({ _id: productId }).populate({
        path: "user",
        model: UserModel,
      });
      return product;
    } catch (error) {
      throw error;
    }
  }

  // Create Product To Database
  @Mutation(() => Product)
  async createProduct(
    @Ctx() { req }: AppContext,
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("color") color: string,
    @Arg("size") size: number,
    @Arg("price") price: number,
    @Arg("quantity") quantity: number,
    @Arg("imageUrl") imageUrl: string
  ): Promise<Product | undefined | null> {
    try {
      const userId = await isAuthenticated(req);

      if (!userId) throw new Error("Please Login to Process...!");

      const product = await ProductModel.create({
        name,
        description,
        color,
        size,
        price,
        quantity,
        imageUrl,
        user: userId,
      });

      const user = await UserModel.findById(userId);

      if (!user.products) {
        user.products = [product];
      } else {
        user.products.push(product);
      }

      await user.save();

      return ProductModel.findById(product.id); 

    } catch (error) {
      throw error;
    }
  }

  //Update Product Database as SuperA Admin
  @Mutation(() => Product)
  async updateProduct(
    @Ctx() { req }: AppContext,
    @Arg("productId") productId: string,
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("color") color: string,
    @Arg("size") size: number,
    @Arg("price") price: number,
    @Arg("quantity") quantity: number,
    @Arg("imageUrl") imageUrl: string
  ): Promise<Product | undefined | null> {
    try {
      //Check user login
      const user = await isAuthenticated(req);

      console.log("Login User:", user._id);

      if (!user) throw new Error("Please Login to proceed...!");

      //Find Owner Product with ID
      const product = await ProductModel.findById({ _id: productId });

      console.log("Prod User", product.user._id);

      //-->Check owner Product by User ID --> i've got problem with this lines
      if( product.user.toString() !== user._id) {
        throw new Error("You are not authorized...!");
      }

      const updateInfo = {
        name: !!name ? name : product.name,
        description: !!description ? description : product.description,
        color: !!color ? color : product.color,
        size: !!size ? size : product.size,
        price: !!price ? price : product.price,
        quantity: !!quantity ? quantity : product.quantity,
        imageUrl: !!imageUrl ? imageUrl : product.imageUrl,
      };

      await ProductModel.findByIdAndUpdate(productId, updateInfo);

      const updatedProduct = await ProductModel.findById(productId).populate({
        path: "user",
        model: UserModel,
      });

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ResponseMessage, { nullable: true })
  async deleteProduct(
    @Arg("productId") productId: string, //User were update roles
    @Ctx() { req }: AppContext //App Context Super User
  ): Promise<ResponseMessage | null>{
    try {
      //Check Loged in User
      const user = await isAuthenticated(req);

      if(!user) throw new Error('Please Login to proceed...!');

      const product = await ProductModel.findById({ _id: productId });

      console.log(product)

      //Check owner Product
      if(user._id !== product.user._id.toString()){
        throw new Error("You are not authorized...!");
      }

      //Find Product from Product Model and Remove by ID
      const deleteProduct = await ProductModel.findByIdAndRemove({ _id: productId})

      //remove releationship Product ID  from User products ID
      const updatedUserProducts = user.products.filter(
        (productId: any) => productId.toString() !== deleteProduct.id.toString()
      );

      await UserModel.findByIdAndUpdate(user._id, {
        products: updatedUserProducts
      })

      return { message: `Product id: ${productId} has been deleted...!`}
    } catch (error) {
      throw error;
    }
  }
}