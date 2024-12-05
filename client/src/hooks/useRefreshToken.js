import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await axios.get("/refresh", {
      withCredentials: true,
    });
    setAuth((prev) => {
      const newAuth = {
        ...prev,
        roles: response.data.roles,
        accessToken: response.data.accessToken,
      };

      localStorage.setItem("auth", JSON.stringify(newAuth));
      return newAuth;
    });
    return response.data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
