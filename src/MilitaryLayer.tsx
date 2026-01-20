import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import axios from "axios";
import osmtogeojson from "osmtogeojson";
import L from "leaflet";
import type { MilitaryType } from "./types/militaryTypes";
import { MILITARY_LABELS} from "./types/MilitaryConst"; 
import { MILITARY_TYPES } from "./types/MilitaryConst";

type GeoJSONData = GeoJSON.FeatureCollection;


export default function MilitaryOSMLayer() {
  const [militaryType, setMilitaryType] = useState<MilitaryType>("naval_base");

  
  const [data, setData] = useState<GeoJSONData | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  
  
  const [error, setError] = useState<string | null>(null);

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  const fetchData = async (type: MilitaryType) => {

    setLoading(true);
    setError(null);
    setData(null);

    const query = `
      [out:json][timeout:25];
      area["ISO3166-1"="PL"]->.a;
      (
        node["military"="${type}"](area.a);
        way["military"="${type}"](area.a);
        relation["military"="${type}"](area.a);
      );
      out geom;
    `;
    const requestUrl = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

    try {
      
      const res = await axios.get(requestUrl);

      
      console.log("Surowe dane z Overpass:", res.data);

      
      const geojson = osmtogeojson(res.data) as GeoJSONData;

      if (!geojson.features || geojson.features.length === 0) {
        
        setData(null);
        setError(`Nie znaleziono obiektów typu: ${MILITARY_LABELS[type]}`);
      } else {
        
        setData(geojson);
      }

    } catch (e) {
      console.error("Błąd pobierania:", e);
      
      setData(null);
      setError("Nie udało się pobrać danych. Sprawdź połączenie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(militaryType);
  }, [militaryType]);

  
  useEffect(() => {
    if (!data || !layerRef.current) return;
    const timer = setTimeout(() => {
        const layer = layerRef.current;
        if (layer && layer.getLayers().length > 0) {
             const bounds = layer.getBounds();
             if (bounds.isValid()) map.fitBounds(bounds, { animate: true, padding: [50, 50] });
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [data, map]);

  return (
    <>
      
      {loading && (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "24px", fontWeight: "bold"
        }}>
          Pobieranie: {MILITARY_LABELS[militaryType]}...
        </div>
      )}

      
      {error && (
        <div style={{
            position: "absolute", top: "10px", right: "10px", zIndex: 2000,
            background: "#ffebee", color: "#c62828", padding: "12px",
            borderRadius: "8px", border: "1px solid #ef9a9a", fontWeight: "bold"
        }}>
            ⚠️ {error}
        </div>
      )}


      <div style={{
          position: "absolute", top: "20px", left: "60px", zIndex: 1000,
          background: "rgba(255,255,255,0.95)", padding: "12px",
          borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          maxWidth: "320px", maxHeight: "80vh", overflowY: "auto"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Typ obiektu:</div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {MILITARY_TYPES.map((type) => (
            <button
                key={type}
                onClick={() => setMilitaryType(type)}
                title={`Kliknij, aby wczytać: ${MILITARY_LABELS[type]}`}
                disabled={loading}
                style={{
                  padding: "6px 12px", borderRadius: "20px",
                  border: "1px solid",
                  borderColor: type === militaryType ? "#b71c1c" : "#ccc",
                  background: type === militaryType ? "#c62828" : "#f5f5f5",
                  color: type === militaryType ? "#fff" : "#333",
                  cursor: loading ? "wait" : "pointer",
                  fontSize: "13px"
                }}
            >
                {MILITARY_LABELS[type]}
            </button>
            ))}
        </div>
      </div>

      {data && !error && (
        <GeoJSON
          key={militaryType}
          data={data}
          ref={layerRef}
          style={{ color: "#ff0000", weight: 2, fillColor: "#ff0000", fillOpacity: 0.4 }}
          onEachFeature={(feature, layer) => {
              const name = feature.properties?.name || "Obiekt wojskowy";
              layer.bindPopup(`<b>${MILITARY_LABELS[militaryType]}</b><br/>${name}`);
          }}
        />
      )}
    </>
  );
}