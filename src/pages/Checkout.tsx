import CloudinaryImage from "@/components/CloudinaryImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersService, productsService, settingsService } from "@/services";
import { Product } from "@/services/types";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  FlaskConical,
  Lock,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>(
    []
  );
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    area: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  // Default delivery charge if product doesn't have one
  const defaultDeliveryCharge = 60;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Fetch available payment methods
  const fetchPaymentMethods = async () => {
    try {
      setPaymentMethodsLoading(true);
      const { data, error } = await settingsService.getEnabledPaymentMethods();

      if (error) {
        throw new Error(error);
      }

      if (data && data.methods.length > 0) {
        setAvailablePaymentMethods(data.methods);
        // Set the first available payment method as default
        setPaymentMethod(data.methods[0].name);
      } else {
        toast({
          title: "No Payment Methods Available",
          description: "Please contact support to place an order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Fetch the AR Chemistry Cards product
  const fetchProduct = async () => {
    try {
      setProductLoading(true);
      // Search for AR Chemistry Cards product
      const { data, error } = await productsService.searchProducts(
        "Chemouflage AR Chemistry Cards"
      );

      if (error) {
        throw new Error(error);
      }

      if (data && data.length > 0) {
        setProduct(data[0]); // Use the first matching product
      } else {
        // Fallback: get all products and use the first one
        const allProductsResponse = await productsService.getProducts({
          active_only: true,
          limit: 1,
        });

        if (
          allProductsResponse.data &&
          allProductsResponse.data.data.length > 0
        ) {
          setProduct(allProductsResponse.data.data[0]);
        } else {
          toast({
            title: "No Products Available",
            description: "No products are currently available for purchase.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product information",
        variant: "destructive",
      });
    } finally {
      setProductLoading(false);
    }
  };
  useEffect(() => {
    fetchPaymentMethods();
    fetchProduct();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place an order.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      } // Check if product is loaded
      if (!product) {
        toast({
          title: "Product Not Available",
          description:
            "Product information is not available. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Submitting order with product:", {
        product_id: product.id,
        name: product.name,
        price: product.price,
      }); // Prepare order data
      const orderData = {
        total_amount: totalAmount,
        payment_method: paymentMethod,
        shipping_address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          area: formData.area,
          zipCode: formData.zipCode,
        },
        items: [
          {
            product_id: product!.id, // Use the actual product ID from database
            quantity: 1,
            price: product!.price,
          },
        ],
      };
      const { data, error } = await ordersService.createOrder(orderData);

      if (error) {
        throw new Error(error);
      }

      // Handle different response types
      if (data) {
        // Check if payment is required (AamarPay)
        if (data.payment_required && data.payment_url) {
          toast({
            title: "Order Created!",
            description: `Order #${data.order.id} created. Redirecting to payment...`,
          });

          // Redirect to AamarPay payment page
          window.location.href = data.payment_url;
          return;
        }

        // Check if payment initiation failed but order was created
        if (data.payment_required && data.payment_error) {
          toast({
            title: "Order Created with Payment Issue",
            description: `Order #${data.order.id} created but payment failed to initialize. ${data.payment_error}`,
            variant: "destructive",
          });

          // Navigate to order tracking or payment retry page
          navigate(`/track/${data.order.id}`);
          return;
        }

        // Regular order (cash on delivery)
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${data.order.id} has been placed. You will receive tracking details soon.`,
        });

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description:
          error.message ||
          "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = product ? product.price + defaultDeliveryCharge : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-teal-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Checkout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                  </div>
                </div>
                <Separator className="bg-teal-500/30" />
                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">
                      Full Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="House/Flat, Road, Block"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Dhaka"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-white">
                        Area/Thana
                      </Label>
                      <Input
                        id="area"
                        name="area"
                        type="text"
                        placeholder="Dhanmondi"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-white">
                      Postal Code (Optional)
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      placeholder="1205"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                    />
                  </div>
                </div>
                <Separator className="bg-teal-500/30" /> {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Payment Method
                  </h3>
                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-white">
                        Loading payment methods...
                      </div>
                    </div>
                  ) : availablePaymentMethods.length === 0 ? (
                    <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                      <p className="text-red-300">
                        No payment methods are currently available.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        {availablePaymentMethods.map((method) => (
                          <div
                            key={method.name}
                            className="flex items-center space-x-2 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30"
                          >
                            <RadioGroupItem
                              value={method.name}
                              id={method.name}
                            />{" "}
                            <Label
                              htmlFor={method.name}
                              className="text-white flex items-center cursor-pointer"
                            >
                              {method.name === "aamarpay" ? (
                                <CloudinaryImage
                                  fileName="download_wyg4lw.png"
                                  alt="AamarPay Logo"
                                  className="w-12 h-4 mr-2"
                                  width={96}
                                  height={24}
                                />
                              ) : method.icon === "smartphone" ? (
                                <Smartphone className="w-4 h-4 mr-2 text-pink-400" />
                              ) : method.icon === "banknote" ? (
                                <Banknote className="w-4 h-4 mr-2 text-emerald-400" />
                              ) : method.icon === "credit-card" ? (
                                <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
                              ) : null}
                              {method.display_name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>{" "}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3"
                  disabled={
                    isLoading ||
                    paymentMethodsLoading ||
                    productLoading ||
                    availablePaymentMethods.length === 0 ||
                    !product
                  }
                  size="lg"
                >
                  {isLoading
                    ? "Processing..."
                    : paymentMethodsLoading || productLoading
                    ? "Loading..."
                    : availablePaymentMethods.length === 0
                    ? "No Payment Methods Available"
                    : !product
                    ? "Product Unavailable"
                    : `Place Order - ৳${totalAmount}`}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Order Summary */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 h-fit">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FlaskConical className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {productLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-white">Loading product...</div>
                </div>
              ) : !product ? (
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                  <p className="text-red-300">Product not available</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-teal-900/20 rounded-lg">
                    <div className="text-4xl">🧪</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ৳{product.price}
                      </div>
                      <div className="text-gray-400 text-sm line-through">
                        ৳{product.original_price}
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-teal-500/30" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Product Price</span>
                      <span>৳{product.original_price}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({product.discount_percentage}% OFF)</span>
                      <span>-৳{product.original_price - product.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Delivery Charge</span>
                      <span>৳{defaultDeliveryCharge}</span>
                    </div>
                  </div>
                  <Separator className="bg-teal-500/30" />
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span>৳{totalAmount}</span>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-emerald-600 text-white mb-2">
                      Limited Time Offer - {product.discount_percentage}% OFF
                    </Badge>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• AR-based 3D molecular visualization</p>
                      <p>• Interactive chemistry simulations</p>
                      <p>• Educational card deck (15+ cards)</p>
                      <p>• Mobile app compatibility</p>
                      <p>• Premium access codes included</p>
                    </div>
                  </div>{" "}
                  <div className="text-xs text-gray-400 mt-4">
                    🔒 Your payment information is secure and encrypted. Order
                    tracking will be available after purchase.
                  </div>
                </>
              )}
            </CardContent>
          </Card>{" "}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-lg border-t border-teal-500/30 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center">
              <CloudinaryImage
                fileName="Footer-Logo_vd1b65.png"
                alt="AamarPay - Secure Payment Gateway"
                className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                height={24}
              />
            </div>
            <p className="text-center text-gray-400 text-sm">
              &copy; 2024 Chemouflage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
