import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl = "/topology.json";

const generateDistinctPastelColors = (count) => {
  const step = 360 / count;
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor(i * step + Math.random() * (step / 3)); // 분산 + 약간의 무작위성
    colors.push(`hsl(${hue}, 70%, 85%)`);
  }
  return colors;
};

const getHoverColor = (hsl) => {
  // ex: 'hsl(120, 70%, 85%)' → 채도 +10, 명도 -10
  return hsl.replace(/hsl\((\d+), (\d+)%, (\d+)%\)/, (_, h, s, l) => {
    return `hsl(${h}, ${Math.min(+s + 10, 100)}%, ${Math.max(+l - 10, 30)}%)`;
  });
};

const SeoulMap = ({ pins = [] }) => {
  const [regionColors, setRegionColors] = useState({});

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => {
        const seoulRegions = data.features.filter(
          (geo) => geo.properties.NAME_1 === "Seoul"
        );

        const pastelPalette = generateDistinctPastelColors(seoulRegions.length);

        const colorMap = {};
        seoulRegions.forEach((geo, idx) => {
          const name = geo.properties.NAME_2;
          colorMap[name] = pastelPalette[idx];
        });

        setRegionColors(colorMap);
      });
  }, []);

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 100000, center: [126.95, 37.53] }}
      width={800}
      height={600}
      style={{ width: "800px", height: "600px" }} // 고정 사이즈 지정
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies
            .filter((geo) => geo.properties.NAME_1 === "Seoul")
            .map((geo) => {
              const name = geo.properties.NAME_2;
              const fillColor = regionColors[name] || "#cccccc";
              const hoverColor = getHoverColor(fillColor);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: "#333",
                      strokeWidth: 1,
                      outline: "none",
                    },
                    hover: {
                      fill: hoverColor,
                      stroke: "#000",
                      strokeWidth: 1,
                      outline: "none",
                    },
                    pressed: {
                      fill: hoverColor,
                      stroke: "#000",
                      strokeWidth: 1,
                      outline: "none",
                    },
                  }}
                />
              );
            })
        }
      </Geographies>
      {/* ✔ 마커 표시 */}
      {pins.map((pin, i) => (
        <Marker key={i} coordinates={[pin.lng, pin.lat]}>
          <circle r={5} fill="#f44336" />

          <foreignObject x={-50} y={-50} width={100} height={40}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                textAlign: "center",
                fontSize: 12,
                backgroundColor: "white",
                border: "1px solid #ccc",
                padding: "4px",
                borderRadius: "4px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              {pin.label}
            </div>
          </foreignObject>
        </Marker>
      ))}
    </ComposableMap>
  );
};

export default SeoulMap;
