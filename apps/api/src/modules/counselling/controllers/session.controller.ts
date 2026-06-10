import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { SessionService } from "../services/sessions.service";
import {
  ListAvailableSlotsQueryInput,
  ListCounsellorsQueryInput,
  ListSessionsQueryInput,
  ListSlotsQueryInput,
  CreatePaymentOrderInput,
} from "../validators/sessions.validator";

export class CounsellorSessionController {
  static async addSlot(req: Request, res: Response) {
    const slot = await SessionService.addSlot(req.userId!, req.body);
    return res.status(201).json(ApiResponse.success("Slot created", slot));
  }

  static async listMySlots(req: Request, res: Response) {
    const slots = await SessionService.listMySlots(
      req.userId!,
      req.query as unknown as ListSlotsQueryInput,
    );
    return res.status(200).json(ApiResponse.success("Slots retrieved", slots));
  }

  static async listSessions(req: Request, res: Response) {
    const sessions = await SessionService.listCounsellorSessions(
      req.userId!,
      req.query as unknown as ListSessionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Sessions retrieved", sessions));
  }

  static async getSession(req: Request, res: Response) {
    const session = await SessionService.getSessionForActor(
      req.params.id as string,
      {
        userType: "counsellor",
        userId: req.userId!,
      },
    );
    return res
      .status(200)
      .json(ApiResponse.success("Session retrieved", session));
  }

  static async cancelSession(req: Request, res: Response) {
    const session = await SessionService.cancelSession(
      req.params.id as string,
      {
        userType: "counsellor",
        userId: req.userId!,
      },
      req.body,
    );

    return res
      .status(200)
      .json(ApiResponse.success("Session cancelled", session));
  }

  static async updateMeeting(req: Request, res: Response) {
    const session = await SessionService.updateMeeting(
      req.userId!,
      req.params.id as string,
      req.body,
    );

    return res
      .status(200)
      .json(ApiResponse.success("Meeting details updated", session));
  }

  static async completeSession(req: Request, res: Response) {
    const session = await SessionService.completeSession(
      req.userId!,
      req.params.id as string,
      req.body,
    );

    return res
      .status(200)
      .json(ApiResponse.success("Session completed", session));
  }

  static async getWallet(req: Request, res: Response) {
    const wallet = await SessionService.getWallet(req.userId!);
    return res
      .status(200)
      .json(ApiResponse.success("Wallet retrieved", wallet));
  }
}

export class StudentSessionController {
  static async listCounsellors(req: Request, res: Response) {
    const result = await SessionService.listCounsellors(
      req.query as unknown as ListCounsellorsQueryInput,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Counsellors retrieved", result.data, result.meta),
      );
  }

  static async createPaymentOrder(req: Request, res: Response) {
    const order = await SessionService.createPaymentOrder(
      req.userId!,
      req.body as CreatePaymentOrderInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Payment order created", order));
  }

  static async listAvailableSlots(req: Request, res: Response) {
    const slots = await SessionService.listAvailableSlots(
      req.query as unknown as ListAvailableSlotsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Available slots retrieved", slots));
  }

  static async bookSession(req: Request, res: Response) {
    const session = await SessionService.bookSession(req.userId!, req.body);
    return res.status(201).json(ApiResponse.success("Session booked", session));
  }

  static async listSessions(req: Request, res: Response) {
    const sessions = await SessionService.listStudentSessions(
      req.userId!,
      req.query as unknown as ListSessionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Sessions retrieved", sessions));
  }

  static async listBookedSessions(req: Request, res: Response) {
    const sessions = await SessionService.listStudentSessionsByStatus(
      req.userId!,
      "booked",
      req.query as unknown as ListSessionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Booked sessions retrieved", sessions));
  }

  static async listCompletedSessions(req: Request, res: Response) {
    const sessions = await SessionService.listStudentSessionsByStatus(
      req.userId!,
      "completed",
      req.query as unknown as ListSessionsQueryInput,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Completed sessions retrieved", sessions));
  }

  static async getSession(req: Request, res: Response) {
    const session = await SessionService.getSessionForActor(
      req.params.id as string,
      {
        userType: "student",
        userId: req.userId!,
      },
    );
    return res
      .status(200)
      .json(ApiResponse.success("Session retrieved", session));
  }

  static async cancelSession(req: Request, res: Response) {
    const session = await SessionService.cancelSession(
      req.params.id as string,
      {
        userType: "student",
        userId: req.userId!,
      },
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Session cancelled", session));
  }

  static async rescheduleSession(req: Request, res: Response) {
    const session = await SessionService.rescheduleSession(
      req.userId!,
      req.params.id as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Session rescheduled", session));
  }

  static async rateSession(req: Request, res: Response) {
    const session = await SessionService.rateSession(
      req.userId!,
      req.params.id as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Session rated successfully", session));
  }
}
