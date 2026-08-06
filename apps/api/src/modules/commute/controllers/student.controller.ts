import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CommuteService } from "../services/commute.service";
import {
  collegeIdQuerySchema,
  setupCommuteSchema,
  scheduleQuerySchema,
  rideHistoryQuerySchema,
} from "../validators/commute.validator";

export class CommuteStudentController {
  static async listRoutes(req: Request, res: Response) {
    const query = collegeIdQuerySchema.parse(req.query);
    const result = await CommuteService.listRoutes(
      req.userId!,
      query.college_id,
    );
    return res.json(ApiResponse.success("Commute routes fetched", result));
  }

  static async listStops(req: Request, res: Response) {
    const query = collegeIdQuerySchema.parse(req.query);
    const result = await CommuteService.listStops(
      req.userId!,
      query.college_id,
      req.params.routeId as string,
    );
    return res.json(ApiResponse.success("Pickup points fetched", result));
  }

  static async listBuses(req: Request, res: Response) {
    const query = collegeIdQuerySchema.parse(req.query);
    const result = await CommuteService.listBuses(
      req.userId!,
      query.college_id,
      req.params.routeId as string,
    );
    return res.json(ApiResponse.success("Buses fetched", result));
  }

  static async getRouteSchedule(req: Request, res: Response) {
    const query = scheduleQuerySchema.parse(req.query);
    const result = await CommuteService.getRouteSchedule(
      req.userId!,
      query.college_id,
      req.params.routeId as string,
      query.period,
    );
    return res.json(ApiResponse.success("Route schedule fetched", result));
  }

  static async setup(req: Request, res: Response) {
    const body = setupCommuteSchema.parse(req.body);
    const result = await CommuteService.setup(req.userId!, body);
    return res
      .status(201)
      .json(ApiResponse.success("Commute set up successfully", result));
  }

  static async modify(req: Request, res: Response) {
    const body = setupCommuteSchema.parse(req.body);
    const result = await CommuteService.modify(req.userId!, body);
    return res.json(
      ApiResponse.success("Commute updated successfully", result),
    );
  }

  static async getDashboard(req: Request, res: Response) {
    const query = collegeIdQuerySchema.parse(req.query);
    const result = await CommuteService.getDashboard(
      req.userId!,
      query.college_id,
    );
    return res.json(ApiResponse.success("Commute dashboard fetched", result));
  }

  static async listRideHistory(req: Request, res: Response) {
    const query = rideHistoryQuerySchema.parse(req.query);
    const result = await CommuteService.listRideHistory(req.userId!, query);
    return res.json(
      ApiResponse.success("Ride history fetched", result.data, result.meta),
    );
  }
}
