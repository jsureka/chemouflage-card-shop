
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Star, Shield, Zap, Users, Menu, X, FlaskConical, Atom, Microscope, Smartphone, Monitor, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Index = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "AR Molecule Viewer",
      description: "Point your camera at any chemistry card to see 3D molecular structures",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      title: "Interactive Periodic Table",
      description: "Tap elements to explore detailed information and properties",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
      gradient: "from-teal-600 to-emerald-600"
    },
    {
      title: "Virtual Chemistry Lab",
      description: "Conduct safe experiments in our virtual laboratory environment",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      title: "Physical AR Cards",
      description: "118 beautifully designed cards with AR-enabled chemistry elements",
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=600&h=400&fit=crop",
      gradient: "from-orange-600 to-red-600"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const features = [
    {
      icon: FlaskConical,
      title: "Advanced Chemistry",
      description: "Professional-grade chemistry learning tools and simulations"
    },
    {
      icon: Atom,
      title: "Interactive Elements",
      description: "Explore the periodic table with immersive 3D interactions"
    },
    {
      icon: Microscope,
      title: "Lab Simulations",
      description: "Virtual laboratory experiences for safe experimentation"
    }
  ];

  const appScreenshots = [
    {
      title: "AR Molecule Viewer",
      description: "Visualize molecular structures in 3D space",
      image: "📱"
    },
    {
      title: "Interactive Periodic Table",
      description: "Tap any element for detailed information",
      image: "💻"
    },
    {
      title: "Virtual Lab Experiments",
      description: "Conduct safe chemistry experiments virtually",
      image: "🧪"
    },
    {
      title: "Chemistry Quiz Mode",
      description: "Test your knowledge with interactive quizzes",
      image: "📚"
    }
  ];

  const arCards = [
    { symbol: "H", name: "Hydrogen", number: 1, color: "from-blue-400 to-blue-600" },
    { symbol: "C", name: "Carbon", number: 6, color: "from-gray-400 to-gray-600" },
    { symbol: "O", name: "Oxygen", number: 8, color: "from-red-400 to-red-600" },
    { symbol: "N", name: "Nitrogen", number: 7, color: "from-purple-400 to-purple-600" },
    { symbol: "Au", name: "Gold", number: 79, color: "from-yellow-400 to-yellow-600" },
    { symbol: "Fe", name: "Iron", number: 26, color: "from-orange-400 to-orange-600" }
  ];

  const product = {
    name: "Chemouflage AR Chemistry Cards",
    description: "The ultimate chemistry education suite with interactive periodic table cards and virtual lab experiences",
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviews: 1247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-teal-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Chemouflage</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-white">Welcome, {user.name}</span>
                    {user.role === 'admin' && (
                      <Link to="/admin">
                        <Button variant="outline" size="sm" className="border-teal-500 text-teal-300 hover:bg-teal-500/20">Admin Panel</Button>
                      </Link>
                    )}
                    <Button onClick={logout} variant="outline" size="sm" className="border-teal-500 text-teal-300 hover:bg-teal-500/20">Logout</Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/login">
                      <Button variant="ghost" className="text-white hover:text-teal-300">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-lg border-t border-teal-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="text-white px-3 py-2">Welcome, {user.name}</div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block">
                      <Button variant="outline" size="sm" className="w-full border-teal-500 text-teal-300">Admin Panel</Button>
                    </Link>
                  )}
                  <Button onClick={logout} variant="outline" size="sm" className="w-full border-teal-500 text-teal-300">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full text-white">Login</Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Image Slider */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-lg animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white mb-6 animate-fade-in">
                🚀 Now with AR Technology
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                Master Chemistry with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                  AR Magic
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl">
                Experience chemistry like never before with our revolutionary AR cards. Point your phone at any card to see molecules come alive in 3D space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/checkout">
                  <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 text-lg hover-scale">
                    <FlaskConical className="w-5 h-5 mr-2" />
                    Get Started - ৳{product.price}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-teal-500 text-teal-300 hover:bg-teal-500/20 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start mt-6 space-x-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-white font-semibold">{product.rating}</span>
                <span className="text-gray-300">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Image Slider */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border border-teal-500/30 shadow-2xl">
                  {/* Slider Images */}
                  <div 
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {heroSlides.map((slide, index) => (
                      <div key={index} className="w-full h-full flex-shrink-0 relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80`}></div>
                        <img 
                          src={slide.image} 
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                          <p className="text-sm text-gray-200">{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentSlide ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating AR Card */}
                <div className="absolute -top-4 -right-4 w-20 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg transform rotate-12 animate-pulse">
                  <div className="h-full flex flex-col justify-center items-center text-white">
                    <span className="text-lg font-bold">C</span>
                    <span className="text-xs">Carbon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Screenshots Slider */}
      <div className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience Chemistry in AR
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              See how our app transforms traditional chemistry learning into an immersive experience
            </p>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {appScreenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="text-center">
                      <div className="text-6xl mb-4">{screenshot.image}</div>
                      <CardTitle className="text-white">{screenshot.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-300 text-center">
                        {screenshot.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-teal-900/50 border-teal-500/30 text-white hover:bg-teal-800/50" />
            <CarouselNext className="bg-teal-900/50 border-teal-500/30 text-white hover:bg-teal-800/50" />
          </Carousel>
        </div>
      </div>

      {/* AR Cards Showcase */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Interactive AR Chemistry Cards
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Each card reveals detailed 3D molecular structures, electron configurations, and interactive experiments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {arCards.map((card, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`relative bg-gradient-to-br ${card.color} rounded-xl p-4 h-32 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <div className="absolute top-2 right-2 text-white/70 text-xs font-medium">{card.number}</div>
                  <div className="h-full flex flex-col justify-center items-center text-white">
                    <span className="text-2xl font-bold mb-1">{card.symbol}</span>
                    <span className="text-xs text-center">{card.name}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <div className="text-white/70 text-xs">AR Ready</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">Over 118 elements available with AR visualization</p>
            <Link to="/checkout">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                Explore All Elements <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Chemouflage?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Built with cutting-edge technology to provide immersive chemistry education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Product Showcase with Correct Pricing */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Revolutionary Chemistry Learning Kit
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Complete with AR cards, mobile app, and premium access codes
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-teal-900/50 to-emerald-900/50 backdrop-blur-lg border-teal-500/30 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="space-y-6">
                  <div>
                    <Badge className="bg-teal-600 text-white mb-4">Featured Product</Badge>
                    <h3 className="text-3xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-300 text-lg">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-white font-semibold">{product.rating}</span>
                    <span className="text-gray-300">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-white">৳{product.price}</span>
                    <span className="text-xl text-gray-400 line-through">৳{product.originalPrice}</span>
                    <Badge variant="destructive">33% OFF</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>✓ 118 AR Chemistry Cards</p>
                    <p>✓ Mobile App with AR Scanner</p>
                    <p>✓ 3D Molecular Visualizations</p>
                    <p>✓ Virtual Lab Simulations</p>
                    <p>✓ Premium Access Codes</p>
                    <p>✓ Lifetime Updates</p>
                  </div>
                  
                  <Link to="/checkout">
                    <Button size="lg" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Order Now - ৳{product.price}
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* Phone Mockup */}
                    <div className="w-64 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl">
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-500/20"></div>
                        <div className="relative z-10 p-6 h-full flex flex-col">
                          <div className="text-center mb-4">
                            <div className="text-white text-sm font-medium">Chemouflage AR</div>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-teal-600 text-2xl font-bold">C</span>
                              </div>
                              <div className="text-white text-lg font-bold">Carbon</div>
                              <div className="text-white/80 text-sm">12.0107</div>
                              <div className="mt-4 text-white/70 text-xs">Point camera at card</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating AR Card */}
                    <div className="absolute -right-8 top-8 w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg transform rotate-12 animate-pulse">
                      <div className="h-full flex flex-col justify-center items-center text-white">
                        <span className="text-sm font-bold">H</span>
                        <span className="text-xs">H₂</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Tech Specs Section */}
      <div className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cutting-Edge Technology
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Built with the latest AR and mobile technologies for seamless learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border-teal-500/30">
              <CardHeader className="text-center">
                <Smartphone className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                <CardTitle className="text-white">Mobile AR</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Advanced AR technology works on any modern smartphone. No special equipment needed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border-teal-500/30">
              <CardHeader className="text-center">
                <Monitor className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                <CardTitle className="text-white">Cross Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Available on iOS, Android, and web browsers. Learn anywhere, anytime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-lg border-teal-500/30">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 mx-auto text-teal-400 mb-4" />
                <CardTitle className="text-white">Real-time 3D</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  High-performance 3D rendering for smooth, interactive molecular visualizations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-lg border-t border-teal-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Chemouflage</h3>
            </div>
            <p className="text-gray-300 mb-8">Advancing chemistry education through innovation and interaction.</p>
            <div className="text-gray-400">
              © 2024 Chemouflage. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
