import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapView.css";
import { ExportButton } from "@/components/ExportButton";
import { FileDown } from 'lucide-react';

// Fix Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define custom icons for vessels
const createVesselIcon = (color: string, type: 'normal' | 'fishing' | 'violation') => {
  const getShipPath = () => {
    const encodedColor = encodeURIComponent(color);
    switch (type) {
      case 'fishing':
        // Wider ship shape for fishing vessels
        return `<path d="M16 4 L24 28 L16 24 L8 28 L16 4" fill="${encodedColor}" stroke="white" stroke-width="2"/>`;
      case 'violation':
        // Same as fishing but with pulsing circle
        return `<path d="M16 4 L24 28 L16 24 L8 28 L16 4" fill="${encodedColor}" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="14" fill="none" stroke="${encodedColor}" stroke-width="2">
                  <animate attributeName="stroke-opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
                </circle>`;
      default:
        // Sleeker shape for normal vessels
        return `<path d="M16 4 L20 28 L16 26 L12 28 L16 4" fill="${encodedColor}" stroke="white" stroke-width="2"/>`;
    }
  };

  const svgString = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">${getShipPath()}</svg>`;

  return new L.Icon({
    iconUrl: svgString,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
    popupAnchor: [0, -28],
    className: type === 'violation' ? 'vessel-icon-pulse' : 'vessel-icon',
  });
};

// Create vessel icons
const icons = {
  normal: createVesselIcon("#3b82f6", 'normal'),     // blue-500
  fishing: createVesselIcon("#f97316", 'fishing'),   // orange-500
  violation: createVesselIcon("#dc2626", 'violation') // red-600
};

interface MapViewProps {
  vessels: Array<{
    latitude: number;
    longitude: number;
    behavior?: string;
    illegal_fishing?: boolean;
    vessel_id?: string;
  }>;
  layers: {
    mpa: boolean;
    eez: boolean;
    ports: boolean;
  };
}

// Placeholder GeoJSON data for zones (replace with actual data)
const mpaZone = {
  type: "Feature",
  properties: { name: "MPA Zone" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-5, 52],
        [-5, 42],
        [5, 42],
        [5, 52],
        [-5, 52],
      ],
    ],
  },
};

const eezZone = {
  type: "Feature",
  properties: { name: "EEZ Boundary" },
  geometry: {
    type: "LineString",
    coordinates: [
      [-10, 55],
      [-10, 40],
      [10, 40],
      [10, 55],
    ],
  },
};

interface VesselMarker {
  latitude: number;
  longitude: number;
  behavior?: string;
  illegal_fishing?: boolean;
  vessel_id?: string;
}

interface MapViewProps {
  vessels: Array<{
    latitude: number;
    longitude: number;
    behavior?: string;
    illegal_fishing?: boolean;
    vessel_id?: string;
  }>;
  layers: {
    mpa: boolean;
    eez: boolean;
    ports: boolean;
  };
  isLoading?: boolean;
  error?: string | null;
  predictions?: any[];
  zoneViolations?: any[];
}

export const MapView = ({ 
  vessels, 
  layers, 
  isLoading = false, 
  error = null,
  predictions,
  zoneViolations 
}: MapViewProps) => {
  // Filter and validate vessels
  const validVessels: VesselMarker[] = vessels?.filter(vessel => {
    // Make sure coordinates exist and are valid numbers
    if (!vessel || vessel.latitude === undefined || vessel.longitude === undefined) {
      console.warn('Vessel missing coordinates:', vessel);
      return false;
    }
    
    const lat = Number(vessel.latitude);
    const lng = Number(vessel.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates:', vessel);
      return false;
    }
    
    // Check coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Coordinates out of range:', vessel);
      return false;
    }
    
    return true;
  }) || [];

  console.log('Valid vessels for map:', validVessels);

  const mapCenter: [number, number] =
    validVessels.length > 0
      ? [Number(validVessels[0].latitude), Number(validVessels[0].longitude)]
      : [20, 0]; // Default center if no vessels

  return (
    <Card className="h-96 overflow-hidden relative">
      <MapContainer
        center={mapCenter}
        zoom={validVessels.length > 0 ? 6 : 3}
        scrollWheelZoom={true}
        className="h-full w-full"
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zone Layers */}
        {layers.mpa && <GeoJSON data={mpaZone as any} style={{ color: "red", weight: 2, opacity: 0.7 }} />}
        {layers.eez && <GeoJSON data={eezZone as any} style={{ color: "blue", weight: 2, opacity: 0.7 }} />}

        {/* Vessel Markers */}
        {validVessels.map((vessel, index) => (
          <Marker
            key={`vessel-${index}`}
            position={[Number(vessel.latitude), Number(vessel.longitude)]}
            icon={
              vessel.illegal_fishing
                ? icons.violation
                : vessel.behavior === "fishing"
                ? icons.fishing
                : icons.normal
            }
          >
            <Popup>
              <b>{vessel.vessel_id || `Vessel ${index + 1}`}</b>
              <br />
              Behavior: {vessel.behavior || "Unknown"}
              <br />
              {vessel.illegal_fishing && (
                <span style={{ color: "red" }}>Violation Detected</span>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls and Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-4 z-[1000]">
        {/* Download Controls - Only shown when results are available */}
        {(predictions?.length > 0 || zoneViolations?.length > 0) && (
          <div className="bg-white p-3 rounded-lg shadow-lg space-y-2">
            <div className="font-medium mb-2 text-xs flex items-center gap-2">
              <FileDown className="h-4 w-4 text-blue-500" />
              <span>Analysis Results</span>
            </div>
            <div className="flex flex-col gap-2">
              {predictions && predictions.length > 0 && (
                <div className="flex items-center gap-2">
                  <ExportButton
                    data={predictions}
                    filename="vessel-predictions"
                    buttonText={`Export Predictions (${predictions.length})`}
                    className="w-full justify-start text-left hover:bg-blue-50"
                    icon={<FileDown className="h-4 w-4 text-blue-500" />}
                  />
                </div>
              )}
              {zoneViolations && zoneViolations.length > 0 && (
                <div className="flex items-center gap-2">
                  <ExportButton
                    data={zoneViolations}
                    filename="zone-violations"
                    buttonText={`Export Violations (${zoneViolations.length})`}
                    className="w-full justify-start text-left hover:bg-red-50"
                    icon={<FileDown className="h-4 w-4 text-red-500" />}
                  />
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                Click to download in JSON or CSV format
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="bg-white p-3 rounded-lg shadow-lg text-xs">
          <div className="font-medium mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span>Normal Vessel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span>Fishing Vessel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span>Violation Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-white/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-slate-700">Loading vessel data...</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg z-[1000] max-w-md">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Error loading data</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* No vessels message */}
      {!isLoading && !error && vessels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <svg className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="text-slate-700 text-lg font-medium">No vessel data to display</div>
            <div className="text-slate-500 mt-2">
              Upload vessel data or select a date range to see positions on map
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};