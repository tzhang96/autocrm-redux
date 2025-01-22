import { User } from '@supabase/supabase-js'

export enum UserRole {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export interface AuthUser extends User {
  role: UserRole;
  email: string;
  full_name?: string;
}

export interface AuthConfig {
  redirects: {
    signIn: string;
    signOut: string;
    unauthorized: string;
  };
  allowedPaths?: string[];
  roleBasedPaths?: {
    [key in UserRole]?: string[];
  };
} 