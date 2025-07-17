
import { Ship, Github, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Ship className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">BlueGuard AI</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              AI-powered illegal fishing detection using vessel behavior prediction 
              and geospatial zone analysis to protect marine protected areas.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/predict" className="text-slate-300 hover:text-white transition-colors">
                  Predict Behavior
                </Link>
              </li>
              <li>
                <Link to="/zone" className="text-slate-300 hover:text-white transition-colors">
                  Zone Detection
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technology</h3>
            <ul className="space-y-2 text-slate-300">
              <li>PyTorch AI Models</li>
              <li>GeoPandas Analysis</li>
              <li>Django REST API</li>
              <li>React Frontend</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2025 BlueGuard AI. Built for marine conservation.</p>
        </div>
      </div>
    </footer>
  );
};
