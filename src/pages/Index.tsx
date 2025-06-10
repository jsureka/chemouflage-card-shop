import CloudinaryImage from "@/components/CloudinaryImage";
import Hero from "@/components/Hero";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  Menu,
  Settings,
  ShoppingCart,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const [premiumARCards, setPremiumARCards] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  ];  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      {" "}
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <CloudinaryImage
              fileName="logoRound_1_yn0smh.png"
              alt="Chemouflage Logo"
              className="w-10 h-10 object-contain"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-foreground">Chemouflage</span>
          </div>          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-teal-500 transition-colors"
            >
              Home
            </Link>{" "}
            <Link
              to="/checkout"
              className="text-foreground hover:text-teal-500 transition-colors"
            >
              Buy Cards
            </Link>
            {user && (
              <Link
                to="/my-orders"
                className="text-foreground hover:text-teal-500 transition-colors"
              >
                My Orders
              </Link>
            )}
            <Link
              to="/track-order"
              className="text-foreground hover:text-teal-500 transition-colors"
            >
              Track Order
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-teal-500 transition-colors"
            >
              Contact
            </Link>
          </div>          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle className="text-foreground" />
            {user ? (
              <>
                <span className="text-foreground hidden lg:inline">
                  Welcome, {user.email}
                </span>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-teal-100/50 dark:hover:bg-teal-900/50"
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
          </div>          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-background/95 backdrop-blur-lg rounded-lg border border-teal-500/30 p-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="text-foreground hover:text-teal-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>{" "}
              <Link
                to="/checkout"
                className="text-foreground hover:text-teal-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <Link
                  to="/my-orders"
                  className="text-foreground hover:text-teal-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              <Link
                to="/track-order"
                className="text-foreground hover:text-teal-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Order
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-teal-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {/* Mobile Auth Section */}
              <div className="border-t border-teal-500/30 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <div className="space-y-3">
                    <div className="text-foreground text-sm">
                      Welcome, {user.email}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full text-foreground hover:bg-teal-100/50 dark:hover:bg-teal-900/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <Hero />      {/* Features Section */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Revolutionary Chemistry Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of chemistry learning with our cutting-edge
              AR technology, interactive simulations, and comprehensive
              educational platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-teal-50/80 dark:bg-teal-900/20 backdrop-blur-lg border-teal-500/30 hover:bg-teal-100/60 dark:hover:bg-teal-900/30 transition-all duration-300"
              >
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-teal-400 mb-4" />
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
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
          <div className="container mx-auto px-4">            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Our Premium Product
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover our flagship AR chemistry educational product
              </p>
            </div>

            <div className="flex justify-center">
              <div className="max-w-md">
                <Card className="bg-teal-50/80 dark:bg-teal-900/20 backdrop-blur-lg border-teal-500/30 hover:bg-teal-100/60 dark:hover:bg-teal-900/30 transition-all duration-300">
                  <CardHeader>
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <CloudinaryImage
                        fileName={premiumARCards.image_url}
                        alt={premiumARCards.name}
                        className="w-full h-full object-cover"
                        width={400}
                        height={600}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                    </div>
                    <div className="flex items-center justify-between">                      <CardTitle className="text-foreground text-lg">
                        {premiumARCards.name}
                      </CardTitle>
                      {premiumARCards.discount_percentage > 0 && (
                        <Badge className="bg-emerald-600">
                          {premiumARCards.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-muted-foreground line-clamp-3">
                      {premiumARCards.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>                        <span className="text-2xl font-bold text-foreground">
                          ৳{premiumARCards.price}
                        </span>
                        {premiumARCards.original_price >
                          premiumARCards.price && (
                          <span className="text-muted-foreground line-through ml-2">
                            ৳{premiumARCards.original_price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-muted-foreground">4.8</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
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
      <footer className="bg-background/80 backdrop-blur-lg border-t border-teal-500/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-foreground">
                  Chemouflage
                </span>
              </div>
              <p className="text-muted-foreground">
                Revolutionary AR chemistry education platform for the next
                generation of scientists.
              </p>
            </div>            <div>
              <h3 className="text-foreground font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    to="/checkout"
                    className="hover:text-teal-400 transition-colors"
                  >
                    AR Chemistry Cards
                  </Link>
                </li>
              </ul>
            </div>{" "}
            <div>
              <h3 className="text-foreground font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    to="/track-order"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>{" "}            <div>
              <h3 className="text-foreground font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="https://www.facebook.com/chemouflage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>{" "}
          <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-muted-foreground">
            <div className="flex items-center justify-center">
              {" "}
              <CloudinaryImage
                fileName="Footer-Logo_vd1b65.png"
                alt="AamarPay - Secure Payment Gateway"
                className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                height={24}
              />
            </div>
            <p>&copy; 2024 Chemouflage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
