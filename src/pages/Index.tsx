
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Star, Shield, Zap, Users, Menu, X } from 'lucide-react';

const Index = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Military-grade encryption to protect your sensitive data"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for seamless user experience"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with advanced sharing capabilities"
    }
  ];

  const product = {
    name: "Chemouflage Pro",
    description: "The ultimate security application suite for modern professionals",
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviews: 1247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
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
                        <Button variant="outline" size="sm">Admin Panel</Button>
                      </Link>
                    )}
                    <Button onClick={logout} variant="outline" size="sm">Logout</Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/login">
                      <Button variant="ghost" className="text-white hover:text-purple-300">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
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
          <div className="md:hidden bg-black/40 backdrop-blur-lg border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="text-white px-3 py-2">Welcome, {user.name}</div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block">
                      <Button variant="outline" size="sm" className="w-full">Admin Panel</Button>
                    </Link>
                  )}
                  <Button onClick={logout} variant="outline" size="sm" className="w-full">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full text-white">Login</Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Sign Up</Button>
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
              Secure Your Digital World with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Chemouflage
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most advanced security application suite designed for professionals who demand the highest level of protection and performance.
            </p>
            <div className="flex justify-center">
              <Link to="/checkout">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg">
                  Get Started Today
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
              Built with cutting-edge technology to provide unmatched security and performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 mx-auto text-purple-400 mb-4" />
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
              Our Premium Solution
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-white/20 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="space-y-6">
                  <div>
                    <Badge className="bg-purple-600 text-white mb-4">Featured Product</Badge>
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
                    <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Now
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div className="text-white text-4xl font-bold">LOGO</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Chemouflage</h3>
            <p className="text-gray-300 mb-8">Securing your digital future, one application at a time.</p>
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
