import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { CallRequestRepository } from "../repositories/call-request.repository";
import type {
  CreateCallRequestInput,
  UpdateCallRequestStatusInput,
} from "@beaconu/types";

function mapListItem(row: {
  id: string;
  collegeId: string;
  phoneNumber: string;
  preferredTime: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  college: { name: string };
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    collegeName: row.college.name,
    phoneNumber: row.phoneNumber,
    preferredTime: row.preferredTime,
    status: row.status as "pending" | "contacted" | "cancelled",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAdminListItem(row: {
  id: string;
  studentId: string;
  phoneNumber: string;
  preferredTime: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  student: { fullName: string; email: string | null };
}) {
  return {
    id: row.id,
    studentId: row.studentId,
    studentName: row.student.fullName,
    studentEmail: row.student.email,
    phoneNumber: row.phoneNumber,
    preferredTime: row.preferredTime,
    status: row.status as "pending" | "contacted" | "cancelled",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDetail(row: {
  id: string;
  collegeId: string;
  studentId: string;
  phoneNumber: string;
  preferredTime: string | null;
  message: string | null;
  status: string;
  staffNote: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  college: { name: string };
  student: { fullName: string; email: string | null };
  responder: { fullName: string } | null;
}) {
  return {
    id: row.id,
    collegeId: row.collegeId,
    collegeName: row.college.name,
    studentId: row.studentId,
    studentName: row.student.fullName,
    studentEmail: row.student.email,
    phoneNumber: row.phoneNumber,
    preferredTime: row.preferredTime,
    message: row.message,
    status: row.status as "pending" | "contacted" | "cancelled",
    staffNote: row.staffNote,
    respondedByName: row.responder?.fullName ?? null,
    respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class CallRequestService {
  static async create(studentId: string, data: CreateCallRequestInput) {
    const college = await CallRequestRepository.findCollege(data.college_id);
    if (!college) throw new NotFoundError("College not found");

    let phoneNumber = data.phone_number ?? null;
    if (!phoneNumber) {
      const student = await CallRequestRepository.findStudentPhone(studentId);
      phoneNumber = student?.phoneNumber ?? null;
    }
    if (!phoneNumber) {
      throw new ValidationError("A phone number is required to request a call");
    }

    const existing =
      await CallRequestRepository.findActivePendingForStudentAndCollege(
        studentId,
        data.college_id,
      );
    if (existing) {
      throw new ConflictError(
        "You already have a pending call request for this college",
      );
    }

    const created = await CallRequestRepository.create({
      studentId,
      collegeId: data.college_id,
      phoneNumber,
      preferredTime: data.preferred_time ?? null,
      message: data.message ?? null,
    });

    return mapDetail(created);
  }

  static async listMine(
    studentId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await CallRequestRepository.listForStudent(
      studentId,
      filters,
      pagination,
    );
    return {
      callRequests: rows.map(mapListItem),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getMine(studentId: string, id: string) {
    const row = await CallRequestRepository.findByIdForStudent(id, studentId);
    if (!row) throw new NotFoundError("Call request not found");
    return mapDetail(row);
  }

  static async cancelMine(studentId: string, id: string) {
    const row = await CallRequestRepository.findByIdForStudent(id, studentId);
    if (!row) throw new NotFoundError("Call request not found");
    if (row.status !== "pending") {
      throw new ConflictError("Only a pending call request can be cancelled");
    }

    const updated = await CallRequestRepository.updateStatus(id, {
      status: "cancelled",
    });
    return mapDetail(updated);
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string; search?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await CallRequestRepository.listForCollege(
      collegeId,
      filters,
      pagination,
    );
    return {
      callRequests: rows.map(mapAdminListItem),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async getForCollege(collegeId: string, id: string) {
    const row = await CallRequestRepository.findByIdForCollege(id, collegeId);
    if (!row) throw new NotFoundError("Call request not found");
    return mapDetail(row);
  }

  static async updateStatus(
    collegeId: string,
    staffId: string,
    id: string,
    data: UpdateCallRequestStatusInput,
  ) {
    const row = await CallRequestRepository.findByIdForCollege(id, collegeId);
    if (!row) throw new NotFoundError("Call request not found");
    if (row.status !== "pending") {
      throw new ConflictError("This call request has already been handled");
    }

    const updated = await CallRequestRepository.updateStatus(id, {
      status: data.status,
      staffNote: data.staff_note ?? null,
      respondedBy: staffId,
      respondedAt: new Date(),
    });
    return mapDetail(updated);
  }
}
