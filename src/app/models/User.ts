export interface User {
  uid: string;
  email: string;
  phone?: string;
  displayName: string;
  city?: number;
  profilePhoto?: string;
  emailVerified: boolean;
}
