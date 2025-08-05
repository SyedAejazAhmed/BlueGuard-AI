import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapView.css";

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

export const MapView = ({ vessels, layers }: MapViewProps) => {
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

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-[1000]">
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

      {/* No vessels message */}
      {vessels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <div className="text-slate-600">No vessel data to display</div>
            <div className="text-sm text-slate-500 mt-1">
              Upload vessel data to see positions on map
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};