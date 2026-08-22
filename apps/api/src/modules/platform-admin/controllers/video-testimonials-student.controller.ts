import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { videoTestimonialSchemas } from "../validators/video-testimonials.validator";
import { VideoTestimonialsQuery } from "../queries/video-testimonials.query";

export class VideoTestimonialsStudentController {
  static async listActive(req: Request, res: Response): Promise<void> {
    const filters = videoTestimonialSchemas.listQuery.parse(req.query);
    const result = await VideoTestimonialsQuery.listActive(filters);
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
}
