import Hero from "@/components/Hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import {
  Box,
  FlaskConical,
  Globe,
  LogOut,
  Settings,
  ShoppingCart,
  Star,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const [premiumARCards, setPremiumARCards] = useState(null);

  useEffect(() => {
    // Find the premium AR cards product
    const arCards = products.find(
      (product) =>
        product.is_active &&
        product.name.toLowerCase().includes("ar") &&
        product.name.toLowerCase().includes("cards")
    );
    setPremiumARCards(arCards);
  }, [products]);

  const features = [
    {
      icon: FlaskConical,
      title: "AR Chemistry Cards",
      description:
        "Interactive periodic table cards with augmented reality visualization",
    },
    {
      icon: Box,
      title: "3D Molecular Viewer",
      description: "Explore complex molecular structures in stunning 3D detail",
    },
    {
      icon: Zap,
      title: "Virtual Lab",
      description:
        "Conduct safe chemistry experiments in our virtual laboratory",
    },
    {
      icon: Globe,
      title: "Educational Platform",
      description:
        "Comprehensive learning resources for students and educators",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Chemouflage</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white">Welcome, {user.email}</span>
                {isAdmin && (
                  <Link to="/admin">
                    {" "}
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-white hover:bg-teal-900/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Revolutionary Chemistry Education
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of chemistry learning with our cutting-edge
              AR technology, interactive simulations, and comprehensive
              educational platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 hover:bg-teal-900/30 transition-all duration-300"
              >
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-teal-400 mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium AR Cards Product Section */}
      {premiumARCards && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Our Premium Product
              </h2>
              <p className="text-xl text-gray-300">
                Discover our flagship AR chemistry educational product
              </p>
            </div>

            <div className="flex justify-center">
              <div className="max-w-md">
                <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 hover:bg-teal-900/30 transition-all duration-300">
                  <CardHeader>
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
                        alt={premiumARCards.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">
                        {premiumARCards.name}
                      </CardTitle>
                      {premiumARCards.discount_percentage > 0 && (
                        <Badge className="bg-emerald-600">
                          {premiumARCards.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-300 line-clamp-3">
                      {premiumARCards.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">
                          ৳{premiumARCards.price}
                        </span>
                        {premiumARCards.original_price >
                          premiumARCards.price && (
                          <span className="text-gray-400 line-through ml-2">
                            ৳{premiumARCards.original_price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-300">4.8</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      <Badge
                        variant="outline"
                        className="text-teal-400 border-teal-400"
                      >
                        {premiumARCards.category}
                      </Badge>
                    </div>

                    <Link to="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-lg border-t border-teal-500/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-6 h-6 text-teal-400" />
                <span className="text-xl font-bold text-white">
                  Chemouflage
                </span>
              </div>
              <p className="text-gray-300">
                Revolutionary AR chemistry education platform for the next
                generation of scientists.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/checkout"
                    className="hover:text-teal-400 transition-colors"
                  >
                    AR Chemistry Cards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Virtual Lab
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Molecule Viewer
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/track-order"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Chemouflage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
