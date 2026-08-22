import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { videoTestimonialSchemas } from "../validators/video-testimonials.validator";
import { VideoTestimonialsService } from "../services/video-testimonials.service";
import { VideoTestimonialsQuery } from "../queries/video-testimonials.query";

export class VideoTestimonialsController {
  static async listAll(req: Request, res: Response): Promise<void> {
    const filters = videoTestimonialSchemas.listQuery.parse(req.query);
    const result = await VideoTestimonialsQuery.listAll(filters);
    res
      .status(200)
      .json(
        ApiResponse.success(
          "Video testimonials fetched",
          result.data,
          result.meta,
        ),
      );
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = videoTestimonialSchemas.idParam.parse(req.params);
    const testimonial = await VideoTestimonialsQuery.getById(id);
    res
      .status(200)
      .json(ApiResponse.success("Video testimonial fetched", testimonial));
  }

  static async create(req: Request, res: Response): Promise<void> {
    const data = videoTestimonialSchemas.create.parse(req.body);
    const testimonial = await VideoTestimonialsService.create(data);
    res
      .status(201)
      .json(ApiResponse.success("Video testimonial created", testimonial));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = videoTestimonialSchemas.idParam.parse(req.params);
    const data = videoTestimonialSchemas.update.parse(req.body);
    const testimonial = await VideoTestimonialsService.update(id, data);
    res
      .status(200)
      .json(ApiResponse.success("Video testimonial updated", testimonial));
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    const { id } = videoTestimonialSchemas.idParam.parse(req.params);
    const testimonial = await VideoTestimonialsService.deactivate(id);
    res
      .status(200)
      .json(ApiResponse.success("Video testimonial deactivated", testimonial));
  }

  static async activate(req: Request, res: Response): Promise<void> {
    const { id } = videoTestimonialSchemas.idParam.parse(req.params);
    const testimonial = await VideoTestimonialsService.activate(id);
    res
      .status(200)
      .json(ApiResponse.success("Video testimonial activated", testimonial));
  }
}
