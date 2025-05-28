
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FlaskConical, Sparkles } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Discover Chemistry with AR",
      subtitle: "Revolutionary AR Chemistry Experience",
      description: "Experience chemistry like never before with our cutting-edge AR technology. Visualize molecular structures, conduct virtual experiments, and unlock the mysteries of the chemical world.",
      image: "/placeholder.svg",
      cta: "Start Exploring"
    },
    {
      title: "Interactive Learning",
      subtitle: "Hands-on Chemistry Education",
      description: "Learn chemistry through interactive AR experiences. From basic elements to complex reactions, our platform makes learning engaging and memorable.",
      image: "/placeholder.svg",
      cta: "Learn More"
    },
    {
      title: "Professional Tools",
      subtitle: "Advanced AR Chemistry Kit",
      description: "Access professional-grade AR chemistry tools and simulations. Perfect for students, educators, and professionals exploring the molecular world.",
      image: "/placeholder.svg",
      cta: "Get Started"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500/5 rounded-full blur-lg animate-bounce" />
      </div>

      {/* Slider Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-teal-400">
              <FlaskConical className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {slides[currentSlide].subtitle}
              </span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-teal-500/25 transition-all duration-300"
              >
                {slides[currentSlide].cta}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Image/Visual Content */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl backdrop-blur-sm border border-teal-500/30 overflow-hidden">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-teal-400 scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default Hero;
