import React from 'react';
import './Legend.css';

interface LegendProps {
  activeLabel: string;
  count: number;
}

export default function Legend({ activeLabel, count }: LegendProps) {
  return (
    <div className="legend-container">
      <div className="legend-title">Aktualna warstwa:</div>
      <div style={{ marginBottom: '5px', color: '#b71c1c', fontWeight: 'bold' }}>
        {activeLabel}
      </div>
      <div className="legend-title">Liczba obiektów:</div>
      <div className="legend-count">{count}</div>
    </div>
  );
}