
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Chemouflage
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-slate-300">
            AR Chemistry Learning Platform
          </p>
          <p className="text-lg mb-8 text-slate-400 max-w-2xl mx-auto">
            Experience chemistry like never before with our cutting-edge augmented reality technology. 
            Learn, experiment, and discover in a safe virtual environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 text-lg"
              onClick={() => navigate('/checkout')}
            >
              Get Started - ৳199
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
