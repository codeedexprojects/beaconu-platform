import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { WishlistQuery } from "../queries/wishlist.query";
import { WishlistService } from "../services/wishlist.service";
import {
  addWishlistSchema,
  wishlistListQuerySchema,
} from "../validators/wishlist.validator";

export class StudentWishlistController {
  static async add(req: Request, res: Response) {
    const { college_id } = addWishlistSchema.parse(req.body);
    await WishlistService.add(req.userId!, college_id);
    return res
      .status(201)
      .json(ApiResponse.success("College added to wishlist", { added: true }));
  }

  static async remove(req: Request, res: Response) {
    await WishlistService.remove(req.userId!, req.params.collegeId as string);
    return res.status(200).json(
      ApiResponse.success("College removed from wishlist", {
        removed: true,
      }),
    );
  }

  static async list(req: Request, res: Response) {
    const filters = wishlistListQuerySchema.parse(req.query);
    const result = await WishlistQuery.listForStudent(req.userId!, filters);
    return res.json(
      ApiResponse.success("Wishlist fetched", {
        colleges: result.colleges,
        meta: result.meta,
      }),
    );
  }
}
