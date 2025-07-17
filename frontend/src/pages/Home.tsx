
import { Link } from "react-router-dom";
import { Ship, Brain, MapPin, BarChart3, Shield, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Behavior Classification",
      description: "Advanced neural networks analyze vessel patterns to predict fishing behavior from AIS data.",
      link: "/predict"
    },
    {
      icon: MapPin,
      title: "Zone Violation Detection",
      description: "Geospatial analysis using MPA, EEZ, and port boundaries to detect illegal fishing activities.",
      link: "/zone"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Interactive dashboards and visualizations for comprehensive maritime monitoring.",
      link: "/about"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90" />
          <Waves className="absolute top-10 right-10 h-32 w-32 text-blue-300/20 animate-pulse" />
          <Ship className="absolute bottom-10 left-10 h-24 w-24 text-blue-400/30" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              BlueGuard AI
              <span className="block text-blue-300">Illegal Fishing Detection</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Combining vessel behavior prediction with geospatial zone analysis 
              to protect marine protected areas and enforce fishing regulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/predict">Try Live Prediction</Link>
              </Button>
              <Button asChild size="lg" className="border-white text-white hover:bg-white/20 hover:text-white">
                <Link to="/zone">Detect Zone Violations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Advanced Maritime Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our system combines multiple AI agents and geospatial analysis 
              to provide comprehensive illegal fishing detection capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="group-hover:bg-blue-50">
                    <Link to={feature.link}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">3+</div>
              <div className="text-slate-600">AI Agents</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-slate-600">MPAs Monitored</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">95%</div>
              <div className="text-slate-600">Accuracy Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-slate-600">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Protect Our Oceans Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the fight against illegal fishing with cutting-edge AI technology 
            and comprehensive maritime monitoring solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/predict">Start Analyzing</Link>
            </Button>
            <Button asChild size="lg" className="border-white text-white hover:bg-white/20 hover:text-white">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
