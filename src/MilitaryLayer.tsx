import { useEffect, useState, useRef, useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { MilitaryType } from "./types/militaryTypes";
import { MILITARY_LABELS } from "./types/MilitaryConst"; 
import { MILITARY_TYPES } from "./types/MilitaryConst";


import './MilitaryLayer.css';
import Legend from './Legend';
import LayerStylePanel from './LayerStylePanel'
import type { LayerStyle } from './LayerStylePanel';

type GeoJSONData = GeoJSON.FeatureCollection;
type SelectionType = MilitaryType | 'all';


export default function MilitaryLayer() {
  const [currentSelection, setCurrentSelection] = useState<SelectionType>("naval_base");
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [layerStyle, setLayerStyle] = useState<LayerStyle>({
    color: "#ff0000",
    weight: 2,
    opacity: 0.4
  });

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  const fetchData = async (type: SelectionType) => {
    setLoading(true);
    setData(null);
    setError(null);

    try {
      let geojson: GeoJSONData;

      if (type === 'all') {
        const promises = MILITARY_TYPES.map(t => fetch(`/data/${t}.json`).then(res => {
            if (!res.ok) throw new Error(`Błąd pliku: ${t}`);
            return res.json();
        }));

        const results = await Promise.all(promises);
        const allFeatures = results.flatMap((g: GeoJSONData) => g.features);
        geojson = { type: "FeatureCollection", features: allFeatures };

      } else {
        const url = `/data/${type}.json`;
        const result = await fetch(url);
        if(!result.ok) throw new Error(`Nie znaleziono pliku: ${url}`);
        geojson = await result.json();
      }

      setData(geojson);

    } catch (err: any) {
      console.error("File read fail.", err);
      setError(err.message || "Błąd pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentSelection);
  }, [currentSelection]);

  useEffect(() => {
    if (!data || !layerRef.current) return;
    const timer = setTimeout(() => {
        const layer = layerRef.current;
        if (layer && Object.keys(layer.getLayers()).length > 0) {
             const bounds = layer.getBounds();
             if (bounds.isValid()) map.fitBounds(bounds, { animate: true, padding: [50, 50] });
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [data, map]);

  const featureCount = useMemo(() => {
    if (!data) return 0;
    return data.features.length;
  }, [data]);

  const currentLabel = currentSelection === 'all' 
    ? "Wszystkie warstwy" 
    : MILITARY_LABELS[currentSelection];

  return (
    <>
      {loading && (
        <div className="loading-overlay">Pobieranie: {currentLabel}...</div>
      )}

      {error && (
        <div className="error-badge">⚠️ {error}</div>
      )}

      <div className="top-panel">
        <div className="panel-title">Typ obiektu:</div>
        <div className="buttons-wrapper">
            {MILITARY_TYPES.map((type) => (
            <button
                key={type}
                onClick={() => setCurrentSelection(type)}
                disabled={loading}
                className={`type-btn ${type === currentSelection ? 'active' : ''}`}
            >
                {MILITARY_LABELS[type]}
            </button>
            ))}
            <button
                onClick={() => setCurrentSelection('all')}
                disabled={loading}
                className={`type-btn all-btn ${currentSelection === 'all' ? 'active' : ''}`}
            >
                Pokaż wszystkie
            </button>
        </div>
      </div>

      <Legend activeLabel={currentLabel} count={featureCount} />
      <LayerStylePanel currentStyle={layerStyle} onStyleChange={setLayerStyle} />

      {data && !error && (
        <GeoJSON
          key={currentSelection}
          data={data}
          ref={layerRef}
          style={{ 
              color: layerStyle.color, 
              weight: layerStyle.weight, 
              fillColor: layerStyle.color, 
              fillOpacity: layerStyle.opacity 
          }}
          onEachFeature={(feature, layer) => {
             const name = feature.properties?.name || "Obiekt wojskowy";
             layer.bindPopup(`<b>${currentLabel}</b><br/>${name}`);
          }}
        />
      )}
    </>
  );
}