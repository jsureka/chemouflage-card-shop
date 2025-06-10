import CloudinaryImage from "@/components/CloudinaryImage";
import CloudinaryVideo from "@/components/CloudinaryVideo";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Available video demos - using Cloudinary for video delivery
  const videoDemos = [
    {
      title: "Effusion Demo",
      cloudinaryId: "4_vnfvq8", // Actual Cloudinary public ID
      fallbackPath: "3. Effusion_",
      description: "Watch how gases diffuse through molecular visualization",
    },
  ];
  const slides = [
    {
      title: "Discover Chemistry with AR",
      subtitle: "Revolutionary AR Chemistry Experience",
      description:
        "Experience chemistry like never before with our cutting-edge AR technology. Visualize molecular structures, conduct virtual experiments, and unlock the mysteries of the chemical world.",
      image: "Screenshot_20250529_001009_Chemouflage_evwx4m",
      cta: "Start Exploring",
    },
    {
      title: "Interactive Learning",
      subtitle: "Hands-on Chemistry Education",
      description:
        "Learn chemistry through interactive AR experiences. From basic elements to complex reactions, our platform makes learning engaging and memorable.",
      image: "Screenshot_20250529_001026_Chemouflage_bko57u",
      cta: "Learn More",
    },
    {
      title: "Professional Tools",
      subtitle: "Advanced AR Chemistry Kit",
      description:
        "Access professional-grade AR chemistry tools and simulations. Perfect for students, educators, and professionals exploring the molecular world.",
      image: "Screenshot_20250529_001902_Chemouflage_1_tpikoy",
      cta: "Get Started",
    },
    {
      title: "Advanced Experiments",
      subtitle: "Complex Chemical Reactions",
      description:
        "Explore advanced chemistry concepts with our comprehensive AR platform. Perfect for higher education and research applications.",
      image: "Screenshot_20250529_002417_Chemouflage_huqki2",
      cta: "Explore Now",
    },
    {
      title: "Molecular Visualization",
      subtitle: "3D Chemical Structures",
      description:
        "Visualize complex molecular structures in stunning 3D detail with our advanced AR technology and interactive learning tools.",
      image: "Screenshot_20250529_012431_Chemouflage_lv8ifd",
      cta: "View Demo",
    },
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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900 overflow-hidden">
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
            {" "}
            <div className="flex items-center space-x-2 text-teal-400 transition-opacity duration-500">
              <FlaskConical className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {slides[currentSlide].subtitle}
              </span>
              <Sparkles className="w-4 h-4" />
            </div>{" "}
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight transition-opacity duration-500">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed transition-opacity duration-500">
              {slides[currentSlide].description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-teal-500/25 transition-all duration-300"
              >
                {slides[currentSlide].cta}
              </Button>{" "}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowVideo(true)}
                className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-background px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demos
              </Button>
            </div>
          </div>{" "}
          {/* Image/Visual Content */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl backdrop-blur-sm border border-teal-500/30 overflow-hidden shadow-2xl">
              {" "}
              <CloudinaryImage
                fileName={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-auto object-contain transition-opacity duration-500"
                width={800}
                height={400}
                quality="auto"
                format="auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
        {" "}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
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
                  ? "bg-teal-400 scale-125 shadow-lg shadow-teal-400/50"
                  : "bg-white/30 hover:bg-white/50 hover:scale-110"
              }`}
            />
          ))}
        </div>{" "}
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>{" "}
      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative bg-black rounded-lg overflow-hidden max-w-5xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-foreground rounded-full p-2 transition-colors"
            >
              ✕
            </button>
            {/* Video Demo Selector */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {videoDemos.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    index === currentVideoIndex
                      ? "bg-teal-500 text-white"
                      : "bg-white/20 text-foreground hover:bg-white/30"
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>{" "}
            {/* Video Title and Description */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/60 rounded-lg p-4">
              <h3 className="text-foreground text-lg font-semibold mb-1">
                {videoDemos[currentVideoIndex].title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {videoDemos[currentVideoIndex].description}
              </p>{" "}
            </div>
            <CloudinaryVideo
              publicId={videoDemos[currentVideoIndex].cloudinaryId}
              fallbackPath={videoDemos[currentVideoIndex].fallbackPath}
              controls
              autoPlay
              key={currentVideoIndex} // Forces video reload when demo changes
              className="w-full h-full"
              width={1280}
              height={720}
              quality="auto"
              format="auto"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
