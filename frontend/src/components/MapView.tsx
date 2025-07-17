
import { Card } from "@/components/ui/card";

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

export const MapView = ({ vessels, layers }: MapViewProps) => {

  return (
    <Card className="h-96 overflow-hidden">
      <div className="w-full h-full relative">
        {/* Placeholder map - Replace with actual mapbox token */}
        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 relative overflow-hidden">
          {/* Mock map background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-16 bg-green-600 rounded-lg opacity-50" />
            <div className="absolute top-1/3 right-1/3 w-24 h-20 bg-green-700 rounded-lg opacity-30" />
            <div className="absolute bottom-1/4 left-1/3 w-40 h-12 bg-green-500 rounded-lg opacity-40" />
          </div>

          {/* Zone overlays */}
          {layers.mpa && (
            <div className="absolute top-1/4 left-1/4 w-32 h-16 border-2 border-red-500 bg-red-200 opacity-60 rounded">
              <div className="absolute -top-6 left-0 text-xs font-medium text-red-700">MPA Zone</div>
            </div>
          )}

          {layers.eez && (
            <div className="absolute top-1/6 left-1/6 w-48 h-32 border-2 border-blue-500 bg-blue-100 opacity-50 rounded">
              <div className="absolute -top-6 left-0 text-xs font-medium text-blue-700">EEZ Boundary</div>
            </div>
          )}

          {/* Vessel markers */}
          {vessels.map((vessel, index) => {
            const x = 20 + (index * 60) % 280; // Distribute vessels across map
            const y = 50 + (index * 40) % 200;
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                    vessel.illegal_fishing
                      ? 'bg-red-600 animate-pulse'
                      : vessel.behavior === 'fishing'
                      ? 'bg-orange-500'
                      : 'bg-blue-600'
                  }`}
                  title={`${vessel.vessel_id || `Vessel ${index + 1}`} - ${vessel.behavior || 'Unknown'}`}
                />
              </div>
            );
          })}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs">
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

          {/* Controls placeholder */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-white p-2 rounded shadow-lg">
              <div className="text-xs text-slate-600">Interactive Map</div>
              <div className="text-xs text-slate-500">Requires Mapbox Token</div>
            </div>
          </div>

          {/* No vessels message */}
          {vessels.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <div className="text-slate-600">No vessel data to display</div>
                <div className="text-sm text-slate-500 mt-1">
                  Upload vessel data to see positions on map
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
