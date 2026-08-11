import { UserRole } from '../enums';

/** Base user information */
export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Auth tokens returned after login */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** OTP request payload */
export interface OtpRequest {
  phone: string;
}

/** OTP verification payload */
export interface OtpVerifyRequest {
  phone: string;
  otp: string;
}

/** Login response */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
