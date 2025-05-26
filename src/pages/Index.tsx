
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Star, Shield, Zap, Users, Menu, X, FlaskConical, Atom, Microscope } from 'lucide-react';

const Index = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const product = {
    name: "Chemouflage Pro",
    description: "The ultimate chemistry education suite with interactive periodic table cards and virtual lab experiences",
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviews: 1247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
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

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Master Chemistry with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                Chemouflage
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most advanced chemistry education platform with interactive periodic table cards, virtual labs, and immersive learning experiences.
            </p>
            <div className="flex justify-center">
              <Link to="/checkout">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 text-lg">
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Start Learning Today
                </Button>
              </Link>
            </div>
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

      {/* Product Showcase */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Premium Chemistry Suite
            </h2>
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
                    <span className="text-3xl font-bold text-white">${product.price}</span>
                    <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                    <Badge variant="destructive">33% OFF</Badge>
                  </div>
                  
                  <Link to="/checkout">
                    <Button size="lg" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Now
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-500/20"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-teal-600 text-2xl font-bold">C</span>
                      </div>
                      <div className="text-white text-sm font-medium text-center">12.0107</div>
                      <div className="text-white/80 text-xs text-center">Carbon</div>
                    </div>
                    <div className="absolute top-4 right-4 text-white/60 text-xs">6</div>
                  </div>
                </div>
              </div>
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
