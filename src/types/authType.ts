import * as z from "zod";

// Login को लागि data structure
export interface ICredentials {
  identifier: string; // यहाँ username वा email दुवै आउँछ
  password: string;
  remember?: boolean;
}

// Zod validation (Frontend validation को लागि)
export const LoginDTO = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// User को profile data (तपाईंको Model अनुसार)
export interface IUser {
  id: string;
  email: string;
  fullname: string;
  phone_no?: string;
  address?: string;
  image?: string | null;
  is_admin: boolean;
  is_editor: boolean;
}

export interface IAuthContext {
  login(credentials: ICredentials): Promise<IUser | void>;
  getLoggedInUser(): Promise<IUser | void>;
  loggedInUser: null | IUser;
  user: null | IUser;
  loading: boolean;
}