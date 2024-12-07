// Lazy horse image imported or hardcoded as URL
import { useNavigate } from "react-router-dom";
import lazyHorseImage from "./staticImage/DALL·E 2024-12-07 14.05.12 - lazy horse.webp";

const LazyHorse = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>The horse didn't get around to it.</h1>
      <img
        src={lazyHorseImage}
        alt="Lazy horse"
        style={{ maxWidth: "500px", marginTop: "20px" }}
      />
      <div>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "30px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LazyHorse;
