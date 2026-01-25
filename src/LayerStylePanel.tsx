import type { ChangeEvent } from 'react';
import './LayerStylePanel.css';

// Eksportujemy typ tutaj, żeby MilitaryLayer mógł go łatwo pobrać
export interface LayerStyle {
  color: string;
  weight: number;
  opacity: number;
}

interface LayerStylePanelProps {
  currentStyle: LayerStyle;
  onStyleChange: (newStyle: LayerStyle) => void;
}

export default function LayerStylePanel({ currentStyle, onStyleChange }: LayerStylePanelProps) {
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onStyleChange({
      ...currentStyle,
      [name]: name === 'color' ? value : Number(value)
    });
  };

  return (
    <div className="style-panel-container">
      <div className="panel-header">Edycja stylu</div>

      <div className="control-group">
        <label>Kolor:</label>
        <input 
          type="color" name="color" 
          value={currentStyle.color} onChange={handleChange} 
          style={{ width: '100%', height: '30px', border: 'none' }}
        />
      </div>

      <div className="control-group">
        <label>Grubość: {currentStyle.weight}px</label>
        <input 
          type="range" name="weight" min="1" max="10" step="1"
          value={currentStyle.weight} onChange={handleChange} 
        />
      </div>

      <div className="control-group">
        <label>Przezroczystość: {Math.round(currentStyle.opacity * 100)}%</label>
        <input 
          type="range" name="opacity" min="0.1" max="1.0" step="0.1"
          value={currentStyle.opacity} onChange={handleChange} 
        />
      </div>
    </div>
  );
}