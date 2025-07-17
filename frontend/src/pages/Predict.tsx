
import { useState } from "react";
import { Upload, Brain, Ship, BarChart3, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VesselCard } from "@/components/VesselCard";
import { Loader } from "@/components/Loader";
import { predictAgent } from "@/api/predictAgent";
import { toast } from "sonner";

const Predict = () => {
  const [loading, setLoading] = useState(false);
  const [agentType, setAgentType] = useState("");
  const [inputMethod, setInputMethod] = useState("manual");
  const [uploadMethod, setUploadMethod] = useState("device");
  const [csvUrl, setCsvUrl] = useState("");
  const [vesselData, setVesselData] = useState({
    sog: "",
    cog: "",
    draft: "",
    longitude: "",
    latitude: "",
    heading: ""
  });
  const [csvData, setCsvData] = useState("");
  const [predictions, setPredictions] = useState(null);

  const agents = [
    { value: "ais", label: "AIS Agent", description: "General vessel behavior from AIS data" },
    { value: "fishing", label: "Fishing Agent", description: "Specialized fishing vessel detection" },
    { value: "kattegat", label: "Kattegat Agent", description: "Region-specific analysis" }
  ];

  const handlePredict = async () => {
    if (!agentType) {
      toast.error("Please select an agent type");
      return;
    }

    setLoading(true);
    try {
      let data;
      if (inputMethod === "manual") {
        if (!vesselData.sog || !vesselData.cog || !vesselData.latitude || !vesselData.longitude) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }
        data = [vesselData];
      } else {
        if (!csvData.trim()) {
          toast.error("Please enter CSV data");
          setLoading(false);
          return;
        }
        // Parse CSV data (simplified)
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
      }

      const result = await predictAgent(data, agentType);
      setPredictions(result);
      toast.success("Prediction completed successfully!");
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Vessel Behavior Prediction
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Use our AI agents to analyze vessel data and predict behavior patterns 
            for illegal fishing detection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Vessel Data Input
                </CardTitle>
                <CardDescription>
                  Enter vessel data manually or upload CSV format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Selection */}
                <div className="space-y-2">
                  <Label htmlFor="agent">Select AI Agent</Label>
                  <Select value={agentType} onValueChange={setAgentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.value} value={agent.value}>
                          <div>
                            <div className="font-medium">{agent.label}</div>
                            <div className="text-sm text-slate-500">{agent.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Input Method Selection */}
                <div className="space-y-2">
                  <Label>Input Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={inputMethod === "manual" ? "default" : "outline"}
                      onClick={() => setInputMethod("manual")}
                      className="flex-1"
                    >
                      Manual Entry
                    </Button>
                    <Button
                      variant={inputMethod === "csv" ? "default" : "outline"}
                      onClick={() => setInputMethod("csv")}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      CSV Upload
                    </Button>
                  </div>
                </div>

                {/* Manual Input */}
                {inputMethod === "manual" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sog">Speed Over Ground (SOG)</Label>
                      <Input
                        id="sog"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 5.2"
                        value={vesselData.sog}
                        onChange={(e) => setVesselData({...vesselData, sog: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cog">Course Over Ground (COG)</Label>
                      <Input
                        id="cog"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 180.5"
                        value={vesselData.cog}
                        onChange={(e) => setVesselData({...vesselData, cog: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 55.123456"
                        value={vesselData.latitude}
                        onChange={(e) => setVesselData({...vesselData, latitude: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 12.123456"
                        value={vesselData.longitude}
                        onChange={(e) => setVesselData({...vesselData, longitude: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft">Draft (meters)</Label>
                      <Input
                        id="draft"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.5"
                        value={vesselData.draft}
                        onChange={(e) => setVesselData({...vesselData, draft: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heading">Heading</Label>
                      <Input
                        id="heading"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 90.0"
                        value={vesselData.heading}
                        onChange={(e) => setVesselData({...vesselData, heading: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* CSV Input */}
                {inputMethod === "csv" && (
                  <div className="space-y-4">
                    {/* Upload Method Selection */}
                    <div className="space-y-2">
                      <Label>Upload Method</Label>
                      <div className="flex gap-4">
                        <Button
                          variant={uploadMethod === "device" ? "default" : "outline"}
                          onClick={() => setUploadMethod("device")}
                          className="flex-1"
                          size="sm"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          From Device
                        </Button>
                        <Button
                          variant={uploadMethod === "url" ? "default" : "outline"}
                          onClick={() => setUploadMethod("url")}
                          className="flex-1"
                          size="sm"
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          From URL
                        </Button>
                      </div>
                    </div>

                    {/* File Upload */}
                    {uploadMethod === "device" && (
                      <div className="space-y-2">
                        <Label htmlFor="csvFile">Choose CSV File</Label>
                        <Input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setCsvData(event.target?.result as string || "");
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* URL Input */}
                    {uploadMethod === "url" && (
                      <div className="space-y-2">
                        <Label htmlFor="csvUrl">CSV File URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="csvUrl"
                            type="url"
                            placeholder="https://example.com/data.csv"
                            value={csvUrl}
                            onChange={(e) => setCsvUrl(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (!csvUrl) return;
                              try {
                                const response = await fetch(csvUrl);
                                const text = await response.text();
                                setCsvData(text);
                                toast.success("CSV data loaded from URL!");
                              } catch (error) {
                                toast.error("Failed to fetch CSV from URL");
                              }
                            }}
                          >
                            Fetch
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* CSV Data Preview/Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="csv">CSV Data {csvData && "(Preview/Edit)"}</Label>
                      <Textarea
                        id="csv"
                        placeholder="sog,cog,latitude,longitude,draft,heading&#10;5.2,180.5,55.123456,12.123456,3.5,90.0&#10;3.1,45.2,55.234567,12.234567,2.8,45.0"
                        className="min-h-32"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                      />
                      <p className="text-sm text-slate-500">
                        Expected CSV headers: sog,cog,latitude,longitude,draft,heading
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handlePredict} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Predict Behavior
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Agent Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Agents</CardTitle>
                <CardDescription>
                  Each agent is specialized for different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.value} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{agent.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{agent.description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>SOG:</strong> Speed Over Ground (knots)</div>
                <div><strong>COG:</strong> Course Over Ground (degrees)</div>
                <div><strong>Position:</strong> Latitude/Longitude</div>
                <div><strong>Draft:</strong> Vessel draft (meters)</div>
                <div><strong>Heading:</strong> Vessel heading (degrees)</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        {predictions && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Prediction Results
                </CardTitle>
                <CardDescription>
                  AI analysis results using {agents.find(a => a.value === agentType)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Analysis Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Vessels Analyzed:</span>
                      <span className="ml-2 font-medium">{predictions.results?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Agent Used:</span>
                      <span className="ml-2 font-medium">{agents.find(a => a.value === agentType)?.label}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Processing Time:</span>
                      <span className="ml-2 font-medium">{predictions.processing_time || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vessel ID</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Behavior</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.results?.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            Vessel {index + 1}
                          </TableCell>
                          <TableCell>
                            {result.latitude}, {result.longitude}
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.behavior === 'fishing' ? 'destructive' : 'secondary'}>
                              {result.behavior || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
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
                          <TableCell colSpan={5} className="text-center text-slate-500">
                            No prediction results available
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

export default Predict;
