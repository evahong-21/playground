import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const KOREA_GEO_URL =
  "https://raw.githubusercontent.com/southkorea/korea-geo/master/korea-municipalities-2021.geojson";

const TARGET_REGIONS = ["서울특별시", "경기도"];

const KoreaMap = () => {
  const [filteredGeoData, setFilteredGeoData] = useState();

  useEffect(() => {
    fetch(KOREA_GEO_URL)
      .then((res) => res.json())
      .then((data) => {
        const filtered = {
          ...data,
          features: data.features.filter((f) =>
            TARGET_REGIONS.includes(f.properties["cty_nm"])
          ),
        };
        setFilteredGeoData(filtered);
      });
  }, []);

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.sig_kor_nm;
    layer.bindTooltip(name, { permanent: false });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          fillColor: "#ff8c00",
          fillOpacity: 0.6,
          weight: 2,
          color: "#444",
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          fillColor: "#3388ff",
          fillOpacity: 0.3,
          weight: 1,
          color: "#333",
        });
      },
    });
  };

  return (
    <div style={{ height: "100vh" }}>
      <MapContainer
        center={[37.5, 127]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredGeoData && (
          <GeoJSON
            data={filteredGeoData}
            style={() => ({
              fillColor: "#3388ff",
              fillOpacity: 0.3,
              weight: 1,
              color: "#333",
            })}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default KoreaMap;
