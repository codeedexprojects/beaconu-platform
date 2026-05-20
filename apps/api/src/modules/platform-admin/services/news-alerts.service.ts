import { NotFoundError } from "@/shared/errors";
import { NewsAlertsRepository } from "../repositories/news-alerts.repostory";

export class NewsAlertsService {
  static async listAll() {
    const newsAlerts = await NewsAlertsRepository.findAll();
    if (!newsAlerts.length) {
      throw new NotFoundError("There are no news alerts");
    }

    return newsAlerts;
  }
}
