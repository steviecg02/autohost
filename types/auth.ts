export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  field?: 'email' | 'password' | 'name';
}

export interface FormValidationError {
  email?: string | undefined;
  password?: string | undefined;
  name?: string | undefined;
}
