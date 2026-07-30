import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import { ApplicationDocumentRepository } from "../repositories/application-document.repository";
import type {
  AddressDetailsInput,
  ApplicationDetailDto,
  DeclarationInput,
  FamilyDetailsInput,
  PersonalDetailsInput,
  QualificationDetailsInput,
} from "@beaconu/types";

/** `{}` (the default for every Application detail JSON column until
 * submit) should fall back to the Student's live profile value — anything
 * else, even a sparsely-filled object, is real data. */
function isEmptyJson(value: unknown): boolean {
  return (
    !value || (typeof value === "object" && Object.keys(value).length === 0)
  );
}

function mergeDetails<T>(frozen: unknown, live: unknown): Partial<T> {
  return (isEmptyJson(frozen) ? (live ?? {}) : frozen) as Partial<T>;
}

export class ApplicationDetailQuery {
  static async getForCollegeAdmin(
    applicationId: string,
    collegeId: string,
  ): Promise<ApplicationDetailDto> {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, collegeId },
      select: {
        id: true,
        applicationNumber: true,
        studentId: true,
        admissionCycleId: true,
        currentStep: true,
        formStatus: true,
        feePaymentStatus: true,
        totalApplicationFee: true,
        nationality: true,
        stateOfDomicile: true,
        passportCountry: true,
        passportNumber: true,
        profilePhotoUrl: true,
        whatsappCountryCode: true,
        whatsappNumber: true,
        personalDetails: true,
        familyDetails: true,
        addressDetails: true,
        qualificationDetails: true,
        declaration: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
            personalDetails: true,
            familyDetails: true,
            addressDetails: true,
            qualificationDetails: true,
          },
        },
        admissionCycle: { select: { id: true, name: true } },
        campus: { select: { name: true } },
      },
    });
    if (!application) {
      throw new NotFoundError("Application not found");
    }

    const [courses, documents] = await Promise.all([
      prisma.applicationCourse.findMany({
        where: { applicationId, status: { not: "withdrawn" } },
        select: {
          id: true,
          courseId: true,
          isPrimary: true,
          status: true,
          applicationFee: true,
          rejectionReason: true,
          statusUpdatedAt: true,
          course: { select: { name: true, code: true } },
          courseQuotaSeat: {
            select: { collegeQuota: { select: { name: true } } },
          },
        },
        orderBy: { preferenceOrder: "asc" },
      }),
      ApplicationDocumentRepository.findUploadedByApplicationId(applicationId),
    ]);

    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
      studentName: application.student.fullName,
      studentEmail: application.student.email,
      studentPhone: application.student.phoneNumber,
      admissionCycleId: application.admissionCycle.id,
      admissionCycleName: application.admissionCycle.name,
      campusName: application.campus?.name ?? null,
      currentStep: application.currentStep,
      formStatus: application.formStatus,
      feePaymentStatus: application.feePaymentStatus,
      totalApplicationFee: application.totalApplicationFee.toString(),
      nationality: application.nationality,
      stateOfDomicile: application.stateOfDomicile,
      passportCountry: application.passportCountry,
      passportNumber: application.passportNumber,
      profilePhotoUrl: application.profilePhotoUrl,
      whatsappCountryCode: application.whatsappCountryCode,
      whatsappNumber: application.whatsappNumber,
      personalDetails: mergeDetails<PersonalDetailsInput>(
        application.personalDetails,
        application.student.personalDetails,
      ),
      familyDetails: mergeDetails<FamilyDetailsInput>(
        application.familyDetails,
        application.student.familyDetails,
      ),
      addressDetails: mergeDetails<AddressDetailsInput>(
        application.addressDetails,
        application.student.addressDetails,
      ),
      qualificationDetails: mergeDetails<QualificationDetailsInput>(
        application.qualificationDetails,
        application.student.qualificationDetails,
      ),
      declaration: (application.declaration ?? {}) as Partial<DeclarationInput>,
      courses: courses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        courseName: c.course.name,
        courseCode: c.course.code,
        isPrimary: c.isPrimary,
        status: c.status,
        applicationFee: c.applicationFee.toString(),
        quotaName: c.courseQuotaSeat?.collegeQuota.name ?? null,
        rejectionReason: c.rejectionReason,
        statusUpdatedAt: c.statusUpdatedAt
          ? c.statusUpdatedAt.toISOString()
          : null,
      })),
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        documentCategory: d.documentCategory,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        verificationStatus: d.verificationStatus,
        rejectionReason: d.rejectionReason,
        createdAt: d.createdAt.toISOString(),
      })),
      submittedAt: application.submittedAt
        ? application.submittedAt.toISOString()
        : null,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    };
  }
}
