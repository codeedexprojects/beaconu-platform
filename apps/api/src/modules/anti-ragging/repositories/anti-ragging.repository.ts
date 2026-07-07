import { randomUUID } from "crypto";
import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";
import type { CreateComplaintInput } from "../validators/anti-ragging.validator";

export class AntiRaggingRepository {
  static async create(
    studentId: string,
    collegeId: string,
    data: CreateComplaintInput,
    initialStatusHistory: Prisma.InputJsonValue,
  ) {
    const individualsInvolved: Prisma.InputJsonValue =
      data.individuals_involved.map((person) => ({
        name: person.name,
        department: person.department ?? null,
        year: person.year ?? null,
        class: person.class ?? null,
      }));
    const attachments: Prisma.InputJsonValue = (data.attachments ?? []).map(
      (file) => ({
        url: file.url,
        name: file.name ?? null,
        sizeBytes: file.size_bytes ?? null,
      }),
    );

    return prisma.antiRaggingComplaint.create({
      data: {
        complaintNumber: `ARC-${randomUUID().slice(0, 8).toUpperCase()}`,
        studentId,
        collegeId,
        incidentType: data.incident_type,
        subject: data.subject,
        individualsInvolved,
        incidentDate: new Date(data.incident_date + "T00:00:00Z"),
        incidentTime: data.incident_time
          ? new Date(`1970-01-01T${data.incident_time}:00Z`)
          : null,
        description: data.description,
        attachments,
        status: "submitted",
        statusHistory: initialStatusHistory,
      },
    });
  }

  static async findById(id: string) {
    return prisma.antiRaggingComplaint.findUnique({ where: { id } });
  }

  static async updateStatus(
    id: string,
    status: "acknowledged" | "investigating",
    assignedTo: string,
    statusHistory: Prisma.InputJsonValue,
  ) {
    return prisma.antiRaggingComplaint.update({
      where: { id },
      data: { status, assignedTo, statusHistory },
    });
  }

  static async resolve(
    id: string,
    resolvedBy: string,
    resolution: string,
    statusHistory: Prisma.InputJsonValue,
  ) {
    return prisma.antiRaggingComplaint.update({
      where: { id },
      data: {
        status: "resolved",
        resolution,
        resolvedAt: new Date(),
        assignedTo: resolvedBy,
        statusHistory,
      },
    });
  }
}
