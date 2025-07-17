
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-300">404</h1>
          <div className="relative -mt-8">
            <div className="text-2xl font-semibold text-slate-900">Page Not Found</div>
          </div>
        </div>
        
        <p className="text-lg text-slate-600 mb-8">
          The page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </span>
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-slate-500">
          Lost at sea? Our AI can help you navigate back to safety.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
