import React, { useState } from "react";
import GyeonggiMap from "../components/GyeonggiMap";
import SeoulMap from "../components/SoeulMap";

const Main = () => {
  const [showGyeonggi, setShowGyeonggi] = useState(false);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>
        {showGyeonggi ? "경기도 지도" : "서울 지도"}
      </h2>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button
          onClick={() => setShowGyeonggi(!showGyeonggi)}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {showGyeonggi ? "서울 보기" : "경기도 보기"}
        </button>
        {showGyeonggi ? (
          <GyeonggiMap />
        ) : (
          <SeoulMap
            pins={[
              {
                label: (
                  <div>
                    <strong>강남구청</strong>
                    <br />
                    🏢 행정센터
                  </div>
                ),
                lat: 37.5172,
                lng: 127.0473,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Main;
