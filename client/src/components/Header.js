import { formateDate } from "../utils/formateDate";
import styles from "../styles/HeadersForm.module.css";
import useLogout from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/linkpage");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>Calorie Calculator</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
      <p className={styles.date}>{formateDate(new Date())}</p>
    </header>
  );
};

export default Header;
