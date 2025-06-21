import CloudinaryImage from "@/components/CloudinaryImage";
import Header from "@/components/Header";
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
import { Box, FlaskConical, Globe, ShoppingCart, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

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
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      {/* Navigation */}
      <Header />
      {/* Hero Section */}
      <Hero /> {/* Features Section */}
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
                  <CardTitle className="text-foreground">
                    {feature.title}
                  </CardTitle>
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
          <div className="container mx-auto px-4">
            {" "}
            <div className="text-center mb-16">
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
                      <img
                        src={premiumARCards.image_url}
                        alt={premiumARCards.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                    </div>
                    <div className="flex items-center justify-between">
                      {" "}
                      <CardTitle className="text-foreground text-lg">
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
                      <div>
                        {" "}
                        <span className="text-2xl font-bold text-foreground">
                          ৳{premiumARCards.price}
                        </span>
                        {premiumARCards.original_price >
                          premiumARCards.price && (
                          <span className="text-muted-foreground line-through ml-2">
                            ৳{premiumARCards.original_price}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="text-teal-400 border-teal-400"
                      >
                        {premiumARCards.category}
                      </Badge>
                    </div>{" "}
                    <Link to="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100">
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
      <Footer />
    </div>
  );
};

export default Index;
