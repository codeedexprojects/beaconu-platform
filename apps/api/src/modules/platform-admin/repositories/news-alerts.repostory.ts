import { prisma } from "@beaconu/db";

export class NewsAlertsRepository {
  static async findAll() {
    return prisma.newsAlert.findMany();
  }
}
