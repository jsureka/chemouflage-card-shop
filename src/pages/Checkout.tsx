import CloudinaryImage from "@/components/CloudinaryImage";
import Header from "@/components/Header";
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
  Banknote,
  CreditCard,
  FlaskConical,
  Lock,
  Minus,
  Plus,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>(
    []
  );
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [deliveryCharges, setDeliveryCharges] = useState({
    inside_dhaka: 60,
    outside_dhaka: 120,
  });
  const [deliveryCharge, setDeliveryCharge] = useState(60);
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
  }); // Default delivery charge if product doesn't have one
  const defaultDeliveryCharge = 60;

  // Quantity control functions
  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10)); // Max 10 items
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)); // Min 1 item
  };

  // Calculate delivery charge based on city
  const calculateDeliveryCharge = (city: string) => {
    const isDhaka = city.toLowerCase().includes("dhaka");
    return isDhaka
      ? deliveryCharges.inside_dhaka
      : deliveryCharges.outside_dhaka;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update delivery charge when city changes
    if (name === "city") {
      const newDeliveryCharge = calculateDeliveryCharge(value);
      setDeliveryCharge(newDeliveryCharge);
    }
  };

  // Fetch delivery charges
  const fetchDeliveryCharges = async () => {
    try {
      const { data, error } = await settingsService.getDeliveryCharges();

      if (error) {
        console.error("Error fetching delivery charges:", error);
        // Use default values if fetch fails
        return;
      }

      if (data) {
        setDeliveryCharges(data);
        // Update current delivery charge based on existing city value
        if (formData.city) {
          const newDeliveryCharge = calculateDeliveryCharge(formData.city);
          setDeliveryCharge(newDeliveryCharge);
        } else {
          setDeliveryCharge(data.inside_dhaka); // Default to inside dhaka
        }
      }
    } catch (error) {
      console.error("Error fetching delivery charges:", error);
    }
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
    fetchDeliveryCharges();
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
            quantity: quantity,
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
  const totalAmount = product ? product.price * quantity + deliveryCharge : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <Card className="bg-background/80 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Checkout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
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
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">
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
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <Separator className="bg-border" />
                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground">
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
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground">
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
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-foreground">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-foreground">
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
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-foreground">
                        Area
                      </Label>
                      <Input
                        id="area"
                        name="area"
                        type="text"
                        placeholder="Dhanmondi"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                        className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-foreground">
                      Zip Code (Optional)
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      placeholder="1000"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                </div>
                <Separator className="bg-border" />
                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Payment Method
                  </h3>
                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-muted-foreground">
                        Loading payment methods...
                      </div>
                    </div>
                  ) : availablePaymentMethods.length === 0 ? (
                    <div className="p-4 bg-destructive/20 rounded-lg border border-destructive/50">
                      <p className="text-destructive">
                        No payment methods available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {" "}
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-3"
                      >
                        {availablePaymentMethods.map((method) => (
                          <div
                            key={method.name}
                            className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-background/40 transition-colors"
                          >
                            <RadioGroupItem
                              value={method.name}
                              id={method.name}
                            />{" "}
                            <Label
                              htmlFor={method.name}
                              className="text-foreground flex items-center cursor-pointer"
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
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
          <Card className="bg-background/80 backdrop-blur-lg border border-border h-fit">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <FlaskConical className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">
                    Loading product...
                  </div>
                </div>
              ) : !product ? (
                <div className="p-4 bg-destructive/20 rounded-lg border border-destructive/50">
                  <p className="text-destructive">Product not available</p>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="flex items-center space-x-4 p-4 bg-background/40 border border-border rounded-lg">
                    <div className="text-4xl">
                      <CloudinaryImage
                        fileName={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg"
                        width={64}
                        height={64}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-foreground font-bold">
                          ৳{product.price}
                        </p>
                        <div className="flex items-center space-x-2">
                          {" "}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="h-8 w-8 p-0 border-border hover:bg-muted bg-background dark:bg-white dark:text-gray-800"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-foreground font-medium min-w-[2rem] text-center">
                            {quantity}
                          </span>{" "}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={incrementQuantity}
                            disabled={quantity >= 10}
                            className="h-8 w-8 p-0 border-border hover:bg-muted bg-background dark:bg-white dark:text-gray-800"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Subtotal ({quantity} {quantity === 1 ? "item" : "items"}
                        )
                      </span>
                      <span>৳{product.price * quantity}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Delivery Charge
                        {formData.city && (
                          <span className="text-xs ml-1">
                            (
                            {formData.city.toLowerCase().includes("dhaka")
                              ? "Inside Dhaka"
                              : "Outside Dhaka"}
                            )
                          </span>
                        )}
                      </span>
                      <span>৳{deliveryCharge}</span>
                    </div>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between text-xl font-bold text-foreground">
                    <span>Total</span>
                    <span>৳{totalAmount}</span>
                  </div>{" "}
                  <div className="mt-4">
                    <Badge className="bg-emerald-600 text-white mb-2">
                      Limited Time Offer - {product.discount_percentage}% OFF
                    </Badge>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• AR-based 3D molecular visualization</p>
                      <p>• Interactive chemistry simulations</p>
                      <p>• Educational card deck (15+ cards)</p>
                      <p>• Mobile app compatibility</p>
                      <p>• Premium access codes included</p>
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-2">
                      Maximum 10 items per order
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground/80 mt-4">
                    🔒 Your payment information is secure and encrypted. Order
                    tracking will be available after purchase.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-lg border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center">
              <CloudinaryImage
                fileName="Footer-Logo_vd1b65.png"
                alt="AamarPay - Secure Payment Gateway"
                className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                height={24}
                width={400}
              />
            </div>
            <p className="text-center text-muted-foreground text-sm">
              &copy; 2024 Chemouflage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
