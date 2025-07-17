
import { Brain, Map, Database, Code, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const technologies = [
    { name: "PyTorch", category: "AI/ML", description: "Deep learning framework for neural networks" },
    { name: "GeoPandas", category: "Geospatial", description: "Geospatial data manipulation and analysis" },
    { name: "Django REST", category: "Backend", description: "RESTful API development" },
    { name: "React", category: "Frontend", description: "Modern web interface" },
    { name: "WDPA", category: "Data", description: "World Database on Protected Areas" },
    { name: "Marine Regions", category: "Data", description: "Marine geospatial boundaries" },
    { name: "WPI Maps", category: "Mapping", description: "Open source World Port Index mapping data" }
  ];

  const agents = [
    {
      name: "AIS Agent",
      description: "Analyzes general vessel behavior from Automatic Identification System data",
      features: ["Speed patterns", "Course analysis", "Movement prediction"]
    },
    {
      name: "Fishing Agent",
      description: "Specialized neural network trained specifically on fishing vessel behaviors",
      features: ["Fishing activity detection", "Vessel type classification", "Behavior patterns"]
    },
    {
      name: "Kattegat Agent",
      description: "Region-specific model trained on Kattegat Sea area data",
      features: ["Regional optimization", "Local pattern recognition", "Area-specific insights"]
    }
  ];

  const datasets = [
    {
      name: "AIS Maritime Data",
      description: "Vessel tracking and behavior data from Automatic Identification Systems",
      usage: "Training general vessel behavior models"
    },
    {
      name: "Kattegat Sea Dataset",
      description: "Regional maritime activity data from the Kattegat Sea area",
      usage: "Region-specific model training and validation"
    },
    {
      name: "WDPA Protected Areas",
      description: "World Database on Protected Areas marine boundaries",
      usage: "Marine Protected Area violation detection"
    },
    {
      name: "EEZ Boundaries",
      description: "Exclusive Economic Zone boundaries from Marine Regions",
      usage: "Territorial water violation detection"
    },
    {
      name: "WPI Open Source Maps",
      description: "World Port Index maritime mapping data and visualization tools",
      usage: "Port location mapping and maritime infrastructure visualization"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-20 w-20 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            About BlueGuard AI
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            An advanced AI-powered system combining vessel behavior prediction with geospatial 
            zone analysis to detect illegal fishing activities and protect marine ecosystems.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                <p className="text-lg text-slate-700 max-w-4xl mx-auto">
                  To protect marine ecosystems by leveraging cutting-edge artificial intelligence 
                  and geospatial analysis to detect, monitor, and prevent illegal fishing activities 
                  in real-time. We combine multiple AI agents with comprehensive zone analysis 
                  to provide maritime authorities with powerful tools for ocean conservation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>1. AI Behavior Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Multiple specialized neural networks analyze vessel movement patterns, 
                  speed variations, and course changes to predict fishing behavior.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Map className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>2. Geospatial Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Vessel positions are cross-referenced with Marine Protected Areas, 
                  EEZ boundaries, and port zones using advanced geospatial analysis.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>3. Violation Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  The system combines behavior predictions with zone analysis to 
                  identify illegal fishing activities and alert authorities in real-time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Agents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">AI Agents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-900">Key Features:</h4>
                    <ul className="space-y-1">
                      {agent.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{tech.name}</h3>
                    <Badge variant="outline">{tech.category}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Datasets */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Data Sources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {datasets.map((dataset, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    {dataset.name}
                  </CardTitle>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Usage:</strong> {dataset.usage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mb-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Code className="h-6 w-6" />
                Technical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Machine Learning Pipeline</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Neural network architectures using PyTorch</li>
                    <li>• Multi-agent ensemble approach</li>
                    <li>• Real-time inference capabilities</li>
                    <li>• Continuous model improvement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Geospatial Processing</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Shapefile boundary analysis</li>
                    <li>• Point-in-polygon detection</li>
                    <li>• Multi-zone overlap handling</li>
                    <li>• Efficient spatial indexing</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">System Architecture</h3>
                <p className="text-slate-600 mb-4">
                  The system follows a modular architecture with clear separation between 
                  AI inference, geospatial analysis, and web interface components.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>PyTorch Models</Badge>
                  <Badge>GeoPandas Engine</Badge>
                  <Badge>Django REST API</Badge>
                  <Badge>React Frontend</Badge>
                  <Badge>PostgreSQL Database</Badge>
                  <Badge>Redis Caching</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Licensing & Attribution */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Open Source & Licensing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Data Attribution</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• WPI (World Port Index) mapping data used under open source license</li>
                    <li>• WDPA protected areas data from UNEP-WCMC</li>
                    <li>• EEZ boundaries from Marine Regions database</li>
                    <li>• AIS vessel tracking data from maritime authorities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Project License</h3>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-slate-700 mb-3">
                      <strong>BlueGuard AI</strong> is released under the MIT License, 
                      promoting open science and collaborative ocean conservation efforts.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">MIT Licensed</Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300">Open Source</Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300">Attribution Required</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team & Contact */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
            <CardContent className="p-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-300" />
              <h2 className="text-2xl font-bold mb-4">Built for Conservation</h2>
              <p className="text-blue-100 max-w-2xl mx-auto mb-6">
                This project represents a commitment to using advanced technology 
                for environmental protection and sustainable fishing practices. 
                Together, we can protect our oceans for future generations.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="secondary">Open Source</Badge>
                <Badge variant="secondary">Research Driven</Badge>
                <Badge variant="secondary">Conservation Focused</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
