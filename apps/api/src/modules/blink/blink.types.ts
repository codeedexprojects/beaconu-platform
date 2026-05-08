export interface RegisterAssociateAdminData {
  full_name: string;
  email: string;
  phone_number?: string;
  country?: string;
  agency_name: string;
  agency_reg_number: string;
  password: string;
}

export interface RegisterAssociateEmployeeData {
  full_name: string;
  email: string;
  phone_number?: string;
  associate_parent_id: string;
  password: string;
}

export interface RegisterCampusAmbassadorData {
  full_name: string;
  email: string;
  phone_number?: string;
  college_id: string;
  linked_student_id?: string;
  ambassador_type: 'student' | 'teacher';
  password: string;
}

export interface UpdateAssociateEmployeeStatusData {
  status: 'active' | 'inactive' | 'suspended' | 'rejected';
}

export interface BlinkLoginData {
  email: string;
  password: string;
}

export interface BlinkRepositoryCreateData {
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  country?: string;
  agencyName?: string;
  agencyRegNumber?: string;
  associateParentId?: string;
  roleId: string;
  status: string;
  collegeId?: string;
  linkedStudentId?: string;
  ambassadorType?: string;
  createdByStaffId?: string;
}
