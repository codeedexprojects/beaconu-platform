export interface CreateBlinkUserData {
  agency_reg_number: string;
  agency_name: string;
  agency_email: string;
  agency_phone_no: string;
  country: string;
  password: string;
  confirm_password: string;
}

export interface BlinkLoginData {
  agency_reg_number: string;
  agency_email: string;
  password: string;
}

export interface BlinkRepositoryCreateData {
  agencyRegNumber: string;
  agencyName: string;
  agencyEmail: string;
  agencyPhoneNo: string;
  country: string;
  passwordHash: string;
  roleId: string;
}
