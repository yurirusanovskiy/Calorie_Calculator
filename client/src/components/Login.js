import { useRef, useState, useEffect } from "react";
import styles from "../styles/AuthForm.module.css"; // Импортируем стили
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";

const LOGIN_URL = "/auth/token";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        new URLSearchParams({
          username: user,
          password: pwd,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
        }
      );

      const accessToken = response?.data?.access_token;
      setAuth({ user, accessToken }); // Пароль можно не сохранять в состоянии
      setUser("");
      setPwd("");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <section className={styles.section}>
      <p
        ref={errRef}
        className={errMsg ? styles.errmsg : styles.offscreen}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <h1 className={styles.title}>Sign In</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="username" className={styles.label}>
          Username:
        </label>
        <input
          type="text"
          id="username"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setUser(e.target.value)}
          value={user}
          required
          className={styles.input}
        />

        <label htmlFor="password" className={styles.label}>
          Password:
        </label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
          className={styles.input}
        />

        <button className={styles.button}>Sign In</button>

        <div className={styles.persistCheck}>
          <input
            type="checkbox"
            id="persist"
            onChange={togglePersist}
            checked={persist}
            className={styles.checkbox}
          />
          <label htmlFor="persist" className={styles.checkboxLabel}>
            Trust This Device
          </label>
        </div>
      </form>

      <p className={styles.text}>
        Need an Account?{" "}
        <span className={styles.line}>
          <Link to="/register" className={styles.link}>
            Sign Up
          </Link>
        </span>
      </p>
    </section>
  );
};

export default Login;

// import { useRef, useState, useEffect } from "react";
// import styles from "../styles/AuthForm.module.css";
// import useAuth from "../hooks/useAuth";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "../api/axios";

// const LOGIN_URL = "/auth/token";

// const Login = () => {
//   const { setAuth, persist, setPersist } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || "/";

//   const userRef = useRef();
//   const errRef = useRef();

//   const [user, setUser] = useState("");
//   const [pwd, setPwd] = useState("");
//   const [errMsg, setErrMsg] = useState("");

//   useEffect(() => {
//     userRef.current.focus();
//   }, []);

//   useEffect(() => {
//     setErrMsg("");
//   }, [user, pwd]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post(
//         LOGIN_URL,
//         new URLSearchParams({
//           username: user,
//           password: pwd,
//         }),
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           withCredentials: true,
//         }
//       );

//       const accessToken = response?.data?.access_token;
//       setAuth({ user, accessToken }); // Пароль можно не сохранять в состоянии
//       setUser("");
//       setPwd("");
//       navigate(from, { replace: true });
//     } catch (err) {
//       if (!err?.response) {
//         setErrMsg("No Server Response");
//       } else if (err.response?.status === 400) {
//         setErrMsg("Missing Username or Password");
//       } else if (err.response?.status === 401) {
//         setErrMsg("Unauthorized");
//       } else {
//         setErrMsg("Login Failed");
//       }
//       errRef.current.focus();
//     }
//   };

//   const togglePersist = () => {
//     setPersist((prev) => !prev);
//   };

//   useEffect(() => {
//     localStorage.setItem("persist", persist);
//   }, [persist]);

//   return (
//     <section>
//       <p
//         ref={errRef}
//         className={errMsg ? "errmsg" : "offscreen"}
//         aria-live="assertive"
//       >
//         {errMsg}
//       </p>
//       <h1>Sign In</h1>
//       <form onSubmit={handleSubmit}>
//         <label htmlFor="username">Username:</label>
//         <input
//           type="text"
//           id="username"
//           ref={userRef}
//           autoComplete="off"
//           onChange={(e) => setUser(e.target.value)}
//           value={user}
//           required
//         />

//         <label htmlFor="password">Password:</label>
//         <input
//           type="password"
//           id="password"
//           onChange={(e) => setPwd(e.target.value)}
//           value={pwd}
//           required
//         />
//         <button>Sign In</button>
//         <div className="persistCheck">
//           <input
//             type="checkbox"
//             id="persist"
//             onChange={togglePersist}
//             checked={persist}
//           />
//           <label htmlFor="persist">Trust This Device</label>
//         </div>
//       </form>
//       <p>
//         Need an Account?
//         <br />
//         <span className="line">
//           <Link to="/register">Sign Up</Link>
//         </span>
//       </p>
//     </section>
//   );
// };

// export default Login;
