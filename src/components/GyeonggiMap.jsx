import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "/topology.json";

const GyeonggiMap = () => {
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 6500, center: [127.05, 37.4] }}
      width={800}
      height={1000}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies
            .filter((geo) => geo.properties.NAME_1 === "Gyeonggi-do")
            .map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "#90caf9",
                    stroke: "#333",
                    strokeWidth: 1,
                    outline: "none",
                  },
                  hover: {
                    fill: "#f48fb1",
                    stroke: "#000",
                    strokeWidth: 1,
                    outline: "none",
                  },
                  pressed: {
                    fill: "#ce93d8",
                    stroke: "#000",
                    strokeWidth: 1,
                    outline: "none",
                  },
                }}
              />
            ))
        }
      </Geographies>
    </ComposableMap>
  );
};

export default GyeonggiMap;
