// import * as z from "zod";

// export interface ICredentials {
//   username: string;
//   password: string;
// }

// export const LoginDTO = z.object({
//   username: z.string().nonempty("Username is required"),
//   password: z.string().nonempty("Password is required"),
//   remember: z.boolean().optional()
// });

// // User को profile data (तपाईंको Model अनुसार)
// export interface IUser {
//   id: string;
//   email: string;
//   fullname: string;
//   phone_no?: string;
//   address?: string;
//   image?: string | null;
//   is_admin: boolean;
//   is_editor: boolean;
// }

// export interface IAuthContext {
//   login(credentials: ICredentials): Promise<IUser | void>;
//   getLoggedInUser(): Promise<IUser | void>;
//   loggedInUser: null | IUser;
//   user: null | IUser;
//   loading: boolean;
// }



import * as z from "zod";

export interface ICredentials {
  identifier: string; // accepts email OR username
  password: string;
}

export const LoginDTO = z.object({
  identifier: z.string().nonempty("Email or Username is required"),
  password: z.string().nonempty("Password is required"),
  remember: z.boolean().optional()
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