import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/AuthForm.module.css";
import axios from "../api/axios";

const REGISTER_URL = "/auth/register";

const Register = () => {
  const navigate = useNavigate();
  const userRef = useRef();
  const errRef = useRef();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [username, email, password, weight, height, targetWeight, timeFrame]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({
          username,
          email,
          password,
          weight: parseFloat(weight),
          height: parseInt(height),
          target_weight: parseFloat(targetWeight),
          time_frame: parseInt(timeFrame),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
      setWeight("");
      setHeight("");
      setTargetWeight("");
      setTimeFrame("");
      navigate("/login");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username or Email already exists");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <section className={styles.section}>
      {success ? (
        <h1 className={styles.title}>Registration Successful!</h1>
      ) : (
        <>
          <p
            ref={errRef}
            className={errMsg ? styles.errmsg : styles.offscreen}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1 className={styles.title}>Register</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="username" className={styles.label}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
              className={styles.input}
            />

            <label htmlFor="email" className={styles.label}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              className={styles.input}
            />

            <label htmlFor="password" className={styles.label}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              className={styles.input}
            />

            <label htmlFor="weight" className={styles.label}>
              Weight (kg):
            </label>
            <input
              type="number"
              id="weight"
              step="0.1"
              onChange={(e) => setWeight(e.target.value)}
              value={weight}
              required
              className={styles.input}
            />

            <label htmlFor="height" className={styles.label}>
              Height (cm):
            </label>
            <input
              type="number"
              id="height"
              onChange={(e) => setHeight(e.target.value)}
              value={height}
              required
              className={styles.input}
            />

            <label htmlFor="targetWeight" className={styles.label}>
              Target Weight (kg):
            </label>
            <input
              type="number"
              id="targetWeight"
              step="0.1"
              onChange={(e) => setTargetWeight(e.target.value)}
              value={targetWeight}
              required
              className={styles.input}
            />

            <label htmlFor="timeFrame" className={styles.label}>
              Time Frame (days):
            </label>
            <input
              type="number"
              id="timeFrame"
              onChange={(e) => setTimeFrame(e.target.value)}
              value={timeFrame}
              required
              className={styles.input}
            />

            <button className={styles.button}>Sign Up</button>
          </form>
          <p>
            Already have an account?
            <br />
            <span className={styles.line}>
              <Link to="/login" className={styles.link}>
                Sign In
              </Link>
            </span>
          </p>
        </>
      )}
    </section>
  );
};

export default Register;

// import { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/AuthForm.css";
// import axios from "../api/axios";

// const REGISTER_URL = "/auth/register";

// const Register = () => {
//   const navigate = useNavigate();

//   const userRef = useRef();
//   const errRef = useRef();

//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [weight, setWeight] = useState("");
//   const [height, setHeight] = useState("");
//   const [targetWeight, setTargetWeight] = useState("");
//   const [timeFrame, setTimeFrame] = useState("");

//   const [errMsg, setErrMsg] = useState("");
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     userRef.current.focus();
//   }, []);

//   useEffect(() => {
//     setErrMsg("");
//   }, [username, email, password, weight, height, targetWeight, timeFrame]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         REGISTER_URL,
//         JSON.stringify({
//           username,
//           email,
//           password,
//           weight: parseFloat(weight),
//           height: parseInt(height),
//           target_weight: parseFloat(targetWeight),
//           time_frame: parseInt(timeFrame),
//         }),
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       setSuccess(true);
//       setUsername("");
//       setEmail("");
//       setPassword("");
//       setWeight("");
//       setHeight("");
//       setTargetWeight("");
//       setTimeFrame("");
//       navigate("/login");
//     } catch (err) {
//       if (!err?.response) {
//         setErrMsg("No Server Response");
//       } else if (err.response?.status === 409) {
//         setErrMsg("Username or Email already exists");
//       } else {
//         setErrMsg("Registration Failed");
//       }
//       errRef.current.focus();
//     }
//   };

//   return (
//     <section>
//       {success ? (
//         <h1>Registration Successful!</h1>
//       ) : (
//         <>
//           <p
//             ref={errRef}
//             className={errMsg ? "errmsg" : "offscreen"}
//             aria-live="assertive"
//           >
//             {errMsg}
//           </p>
//           <h1>Register</h1>
//           <form onSubmit={handleSubmit}>
//             <label htmlFor="username">Username:</label>
//             <input
//               type="text"
//               id="username"
//               ref={userRef}
//               autoComplete="off"
//               onChange={(e) => setUsername(e.target.value)}
//               value={username}
//               required
//             />

//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               onChange={(e) => setEmail(e.target.value)}
//               value={email}
//               required
//             />

//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               onChange={(e) => setPassword(e.target.value)}
//               value={password}
//               required
//             />

//             <label htmlFor="weight">Weight (kg):</label>
//             <input
//               type="number"
//               id="weight"
//               step="0.1"
//               onChange={(e) => setWeight(e.target.value)}
//               value={weight}
//               required
//             />

//             <label htmlFor="height">Height (cm):</label>
//             <input
//               type="number"
//               id="height"
//               onChange={(e) => setHeight(e.target.value)}
//               value={height}
//               required
//             />

//             <label htmlFor="targetWeight">Target Weight (kg):</label>
//             <input
//               type="number"
//               id="targetWeight"
//               step="0.1"
//               onChange={(e) => setTargetWeight(e.target.value)}
//               value={targetWeight}
//               required
//             />

//             <label htmlFor="timeFrame">Time Frame (days):</label>
//             <input
//               type="number"
//               id="timeFrame"
//               onChange={(e) => setTimeFrame(e.target.value)}
//               value={timeFrame}
//               required
//             />

//             <button>Sign Up</button>
//           </form>
//           <p>
//             Already have an account?
//             <br />
//             <span className="line">
//               <Link to="/login">Sign In</Link>
//             </span>
//           </p>
//         </>
//       )}
//     </section>
//   );
// };

// export default Register;