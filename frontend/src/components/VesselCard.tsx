
import { Ship, MapPin, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VesselCardProps {
  vessel: {
    id?: string;
    latitude: number;
    longitude: number;
    behavior?: string;
    sog?: number;
    cog?: number;
    confidence?: number;
    risk_level?: string;
  };
}

export const VesselCard = ({ vessel }: VesselCardProps) => {
  const getBehaviorColor = (behavior: string) => {
    switch (behavior?.toLowerCase()) {
      case 'fishing':
        return 'destructive';
      case 'transit':
        return 'secondary';
      case 'anchored':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ship className="h-5 w-5 text-blue-600" />
          {vessel.id || 'Unknown Vessel'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>
            {vessel.latitude.toFixed(4)}, {vessel.longitude.toFixed(4)}
          </span>
        </div>

        {vessel.behavior && (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-600" />
            <Badge variant={getBehaviorColor(vessel.behavior)}>
              {vessel.behavior}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {vessel.sog !== undefined && (
            <div>
              <span className="text-slate-500">SOG:</span>
              <span className="ml-1 font-medium">{vessel.sog} kts</span>
            </div>
          )}
          {vessel.cog !== undefined && (
            <div>
              <span className="text-slate-500">COG:</span>
              <span className="ml-1 font-medium">{vessel.cog}°</span>
            </div>
          )}
        </div>

        {vessel.confidence !== undefined && (
          <div className="text-sm">
            <span className="text-slate-500">Confidence:</span>
            <span className="ml-1 font-medium">
              {(vessel.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {vessel.risk_level && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Risk Level:</span>
            <Badge variant={getRiskColor(vessel.risk_level)}>
              {vessel.risk_level}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
