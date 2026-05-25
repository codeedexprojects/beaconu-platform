import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { notificationSchemas } from "../validators/notifications.validator";
import { PushService } from "../services/push.service";

export class NotificationsAdminController {
  static async sendPush(req: Request, res: Response): Promise<void> {
    const { user_id, user_type, title, body, data, image_url } =
      notificationSchemas.sendPush.parse(req.body);

    const result = await PushService.sendToUser(user_id, user_type, {
      title,
      body,
      data,
      imageUrl: image_url,
    });

    res
      .status(200)
      .json(ApiResponse.success("Push notification dispatched", result));
  }
}
