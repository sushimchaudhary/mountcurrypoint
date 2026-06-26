// "use client";

// import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
// import { type IAuthContext, type IUser, type ICredentials } from "../../types/authType";
// import Cookies from "js-cookie";
// import axiosInstance from "../config/axios.config";

// const AuthContext = createContext<IAuthContext>({
//   login: async () => {},
//   getLoggedInUser: async () => {},
//   loggedInUser: null,
//   user: null,
//   loading: true,
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [loggedInUser, setLoggedInUser] = useState<IUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   const getLoggedInUser = useCallback(async (): Promise<IUser | void> => {
//     try {
//       const savedUser = Cookies.get("user_info");
//       if (savedUser) {
//         const user = JSON.parse(savedUser);
//         setLoggedInUser(user);
//         return user;
//       }
//     } catch (error) {
//       setLoggedInUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     getLoggedInUser();
//   }, [getLoggedInUser]);

//  const login = async (credentials: ICredentials) => {
//     const res = await axiosInstance.post("/auth/login/", {
//       identifier: credentials.username,
//       password:   credentials.password,
//     });
//     const data = res.data;

//     if (data.access) Cookies.set("access_token", data.access, { expires: 7 });
//     if (data.refresh) Cookies.set("refresh_token", data.refresh, { expires: 7 });

//     const baseUser: IUser = data.user ?? data.data ?? data;
//     Cookies.set("user_info", JSON.stringify(baseUser), { expires: 7 });
    
//     setLoggedInUser(baseUser);
//     return baseUser;
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         login,
//         getLoggedInUser,
//         loggedInUser,
//         user: loggedInUser,
//         loading,
//       }}
//     >
//       {loading ? (
//         <div className="flex items-center justify-center h-screen">Loading..</div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;



"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { type IAuthContext, type IUser, type ICredentials } from "../../types/authType";
import Cookies from "js-cookie";
import axiosInstance from "../config/axios.config";
import Image from "next/image";

const AuthContext = createContext<IAuthContext>({
  login: async () => {},
  getLoggedInUser: async () => {},
  loggedInUser: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getLoggedInUser = useCallback(async (): Promise<IUser | void> => {
    try {
      const savedUser = Cookies.get("user_info");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setLoggedInUser(user);
        return user;
      }
    } catch (error) {
      setLoggedInUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLoggedInUser();
  }, [getLoggedInUser]);

  const login = async (credentials: ICredentials) => {
    const res = await axiosInstance.post("/auth/login/", {
      email: credentials.identifier, // backend expects "email" — works for both email & username
      password: credentials.password,
    });
    const data = res.data;

    if (data.access) Cookies.set("access_token", data.access, { expires: 7 });
    if (data.refresh) Cookies.set("refresh_token", data.refresh, { expires: 7 });

    const baseUser: IUser = data.user ?? data.data ?? data;
    Cookies.set("user_info", JSON.stringify(baseUser), { expires: 7 });
    
    setLoggedInUser(baseUser);
    return baseUser;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        getLoggedInUser,
        loggedInUser,
        user: loggedInUser,
        loading,
      }}
    >
{loading ? (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
            <Image src="/logo.png" alt="Loading..." width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#c47c30] rounded-full animate-spin" />
        </div>
      </div>    
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;