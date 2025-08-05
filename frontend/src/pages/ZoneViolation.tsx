import { useState } from "react";
import { MapPin, Upload, AlertTriangle, Shield, FileText, Globe, FileDown } from "lucide-react";
import type { ZoneCheckResponse } from "@/api/types";
import { toast } from "@/components/ui/use-toast";
import { downloadData } from "@/utils/downloadUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapView } from "@/components/MapView";

interface LocalViolationDetail {
  vessel_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  behavior: string;
  in_mpa: boolean;
  in_eez: boolean;
  in_port: boolean;
  illegal_fishing?: boolean;
  risk_level?: 'low' | 'medium' | 'high';
}

interface LocalZoneResults {
  total_vessels: number;
  violations: number;
  mpa_violations: number;
  eez_violations: number;
  results: LocalViolationDetail[];
}

interface MapViewVessel {
  vessel_id?: string;
  latitude: number;
  longitude: number;
  behavior?: string;
  illegal_fishing?: boolean;
}

const mapApiResponseToLocalFormat = (response: ZoneCheckResponse): LocalZoneResults => {
  return {
    total_vessels: response.total_vessels,
    violations: response.violations,
    mpa_violations: response.mpa_violations,
    eez_violations: response.eez_violations,
    results: response.results.map(detail => ({
      vessel_id: detail.vessel_id,
      timestamp: detail.timestamp,
      latitude: detail.location[0],
      longitude: detail.location[1],
      behavior: detail.details || 'unknown',
      in_mpa: detail.zone_type === 'mpa',
      in_eez: detail.zone_type === 'eez',
      in_port: false, // API doesn't provide this information
      risk_level: detail.severity,
      illegal_fishing: detail.severity === 'high'
    }))
  };
};
import { Loader } from "@/components/Loader";
import { checkZone } from "@/api/checkZone";
import { fetchCSV } from "@/api/apiService";

const ZoneViolation = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    if (!zoneResults?.results?.length) return;

    try {
      downloadData(zoneResults.results, {
        filename: `zone-violations-${new Date().toISOString().split('T')[0]}`,
        type: format,
        includeTimestamp: true
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export the data. Please try again."
      });
    }
  };
  const [csvData, setCsvData] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [uploadType, setUploadType] = useState("device");
    const [zoneResults, setZoneResults] = useState<LocalZoneResults | null>(null);
  const [mapLayers, setMapLayers] = useState({
    mpa: true,
    eez: true,
    ports: false
  });

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result as string || "");
              toast({
        title: "Success",
        description: "CSV file loaded successfully!"
      });
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid CSV file"
      });
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid URL"
      });
      return;
    }

    try {
      const csvContent = await fetchCSV(urlInput);
      setCsvData(csvContent);
      toast({
        title: "Success",
        description: "CSV data fetched from URL successfully!"
      });
    } catch (error) {
      console.error("URL fetch error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch CSV from URL. Please check the URL and try again."
      });
    }
  };

  const handleZoneCheck = async () => {
    if (!csvData.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter or upload vessel data"
      });
      return;
    }

    setLoading(true);
    try {
      // Parse CSV data
        const lines = csvData.trim().split('\n');
        if (lines.length < 2) {
          throw new Error("CSV file is empty or contains only headers");
        }

        // Parse headers and validate required columns
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const latIndex = headers.indexOf('latitude');
        const lonIndex = headers.indexOf('longitude');
        
        if (latIndex === -1 || lonIndex === -1) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "CSV must contain 'latitude' and 'longitude' columns"
          });
          return;
        }

        const data = lines.slice(1)
          .map((line, lineNum) => {
            const values = line.split(',').map(v => v.trim());
            if (values.length !== headers.length) {
              toast({
                variant: "destructive",
                title: "Error",
                description: `Invalid CSV line ${lineNum + 2}: Wrong number of columns`
              });
              return null;
            }
            
            const lat = Number(values[latIndex]);
            const lon = Number(values[lonIndex]);
            
            if (isNaN(lat) || isNaN(lon)) {
              toast({
                variant: "destructive",
                title: "Error",
                description: `Invalid coordinates at line ${lineNum + 2}`
              });
              return null;
            }
            
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
              toast({
                variant: "destructive",
                title: "Error",
                description: `Coordinates out of range at line ${lineNum + 2}`
              });
              return null;
            }

            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              obj[header] = header === 'latitude' || header === 'longitude' 
                ? Number(values[index])
                : values[index];
            });
          
          // Validate coordinates
            return obj;
          })
          .filter((item): item is Record<string, any> => item !== null);

        if (data.length === 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No valid vessel data found in CSV"
          });
          return;
        }

      const result = await checkZone(data);
      setZoneResults(mapApiResponseToLocalFormat(result));
      toast({
        title: "Success",
        description: "Zone analysis completed!"
      });
    } catch (error) {
      console.error("Zone check error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze zones. Displaying mock data."
      });
      if (error.results) {
        setZoneResults(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLayerToggle = (layer) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Zone Violation Detection
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Detect illegal fishing activities by analyzing vessel positions 
            against Marine Protected Areas and Exclusive Economic Zones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Vessel Data Input
                </CardTitle>
                <CardDescription>
                  Enter vessel positions and behavior data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={uploadType} onValueChange={setUploadType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="device" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Upload from Device
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Fetch from URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="device" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csv-file">Upload CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vessel-data">Or Enter CSV Data Manually</Label>
                      <Textarea
                        id="vessel-data"
                        placeholder="latitude,longitude,behavior,vessel_id,timestamp&#10;55.123456,12.123456,fishing,VESSEL001,2024-01-15T10:30:00Z&#10;55.234567,12.234567,transit,VESSEL002,2024-01-15T10:35:00Z"
                        className="min-h-40"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csv-url">CSV File URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="csv-url"
                          type="url"
                          placeholder="https://example.com/vessel-data.csv"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleUrlFetch} variant="outline">
                          Fetch
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fetched-data">Fetched CSV Data</Label>
                      <Textarea
                        id="fetched-data"
                        placeholder="CSV data will appear here after fetching from URL..."
                        className="min-h-40"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <p className="text-sm text-slate-500">
                  Required columns: latitude, longitude, behavior. 
                  Optional: vessel_id, timestamp, speed, heading
                </p>

                <Button 
                  onClick={handleZoneCheck} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2" />
                      Analyzing Zones...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Check Zone Violations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  Vessel positions overlaid with protected zones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MapView 
                  vessels={zoneResults?.results || []}
                  layers={mapLayers}
                />
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Enhanced Mapping:</strong> For detailed worldwide maritime data visualization, 
                    explore our advanced WPI (World Port Index) mapping interface.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://fgmod.nga.mil/apps/WPI-Viewer/', '_blank')}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Open WPI Viewer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map Layers</CardTitle>
                <CardDescription>
                  Toggle zone overlays on the map
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marine Protected Areas</div>
                    <div className="text-sm text-slate-500">WDPA protected zones</div>
                  </div>
                  <Switch
                    checked={mapLayers.mpa}
                    onCheckedChange={() => handleLayerToggle('mpa')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Exclusive Economic Zones</div>
                    <div className="text-sm text-slate-500">National EEZ boundaries</div>
                  </div>
                  <Switch
                    checked={mapLayers.eez}
                    onCheckedChange={() => handleLayerToggle('eez')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Ports & Harbors</div>
                    <div className="text-sm text-slate-500">Port boundaries</div>
                  </div>
                  <Switch
                    checked={mapLayers.ports}
                    onCheckedChange={() => handleLayerToggle('ports')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong className="text-red-600">MPA Violations:</strong>
                  <p className="text-slate-600">Fishing activity in protected areas</p>
                </div>
                <div>
                  <strong className="text-orange-600">EEZ Violations:</strong>
                  <p className="text-slate-600">Unauthorized fishing in territorial waters</p>
                </div>
                <div>
                  <strong className="text-blue-600">Port Areas:</strong>
                  <p className="text-slate-600">Vessel activity near ports</p>
                </div>
              </CardContent>
            </Card>

            {zoneResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Detection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vessels Analyzed:</span>
                    <span className="font-medium">{zoneResults.total_vessels || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Violations Found:</span>
                    <span className="font-medium text-red-600">{zoneResults.violations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MPA Violations:</span>
                    <span className="font-medium">{zoneResults.mpa_violations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EEZ Violations:</span>
                    <span className="font-medium">{zoneResults.eez_violations || 0}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Results Table */}
        {zoneResults && (
          <div className="mt-12">
            <Card>
              <CardHeader className="flex flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Zone Violation Results
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of vessel positions and zone violations
                  </CardDescription>
                </div>
                {zoneResults.results && zoneResults.results.length > 0 && (
                  <div className="flex gap-2 min-w-fit">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleExport('json')}
                    >
                      <FileDown className="h-4 w-4" />
                      Export JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleExport('csv')}
                    >
                      <FileDown className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vessel ID</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Behavior</TableHead>
                        <TableHead>Zone Status</TableHead>
                        <TableHead>Violation Type</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zoneResults.results?.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {result.vessel_id || `Vessel ${index + 1}`}
                          </TableCell>
                          <TableCell>
                            {result.latitude}, {result.longitude}
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.behavior === 'fishing' ? 'destructive' : 'secondary'}>
                              {result.behavior}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.in_mpa && <Badge variant="destructive" className="mr-1">MPA</Badge>}
                            {result.in_eez && <Badge variant="default" className="mr-1">EEZ</Badge>}
                            {result.in_port && <Badge variant="secondary" className="mr-1">Port</Badge>}
                            {!result.in_mpa && !result.in_eez && !result.in_port && (
                              <Badge variant="outline">Open Waters</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.illegal_fishing ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Violation
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No Violation</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              result.risk_level === 'high' ? 'destructive' :
                              result.risk_level === 'medium' ? 'default' : 'secondary'
                            }>
                              {result.risk_level || 'Low'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500">
                            No zone analysis results available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneViolation;