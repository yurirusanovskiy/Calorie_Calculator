import React from "react";
import styles from "../styles/FooterForm.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>© 2024 Calories Tracker. All rights reserved.</p>
      <div>
        <a href="/about" className={styles.link}>
          About
        </a>{" "}
        |
        <a href="/privacy-policy" className={styles.link}>
          {" "}
          Privacy Policy
        </a>{" "}
        |
        <a href="/contact" className={styles.link}>
          {" "}
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
