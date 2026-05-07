export interface CreateBlinkUserData {
  agencyRegNumber: string;
  agencyName: string;
  agencyEmail: string;
  agencyPhoneNo: string;
  country: string;
  passwordHash: string;
  roleId: string;
}

export interface BlinkLoginData {
  agencyRegNumber: string;
  agencyEmail: string;
  password: string;
}
