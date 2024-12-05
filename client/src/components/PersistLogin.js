import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem("auth"));
        console.log("Stored auth in PersistLogin:", storedAuth);
        if (storedAuth?.accessToken) {
          await refresh();
        }
      } catch (err) {
        console.error("Error refreshing token:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!auth?.accessToken && persist) {
      console.log("No auth token, trying to refresh...");
      verifyRefreshToken();
    } else {
      console.log("Auth token exists or persist is off, no need to refresh.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [auth?.accessToken, persist, refresh]);

  return (
    <>{!persist ? <Outlet /> : isLoading ? <p>Loading...</p> : <Outlet />}</>
  );
};

export default PersistLogin;
