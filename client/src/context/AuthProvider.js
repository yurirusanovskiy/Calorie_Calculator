import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      console.log("Stored Auth:", storedAuth);
      return storedAuth || {};
    } catch (error) {
      console.error("Error reading auth from localStorage", error);
      return {};
    }
  });

  const [persist, setPersist] = useState(() => {
    try {
      const storedPersist = JSON.parse(localStorage.getItem("persist"));
      console.log("Stored Persist:", storedPersist);
      return storedPersist ?? false;
    } catch (error) {
      console.error("Error reading persist from localStorage", error);
      return false;
    }
  });

  useEffect(() => {
    if (auth) {
      console.log("Saving auth to localStorage:", auth);
      localStorage.setItem("auth", JSON.stringify(auth));
    }
  }, [auth]);

  useEffect(() => {
    if (persist !== undefined) {
      console.log("Saving persist to localStorage:", persist);
      localStorage.setItem("persist", JSON.stringify(persist));
    }
  }, [persist]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// import { createContext, useState } from "react";

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState(
//     JSON.parse(localStorage.getItem("auth")) || {}
//   );
//   const [persist, setPersist] = useState(
//     JSON.parse(localStorage.getItem("persist")) || false
//   );

//   return (
//     <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
