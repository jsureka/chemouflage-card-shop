import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersService } from "@/services";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  FlaskConical,
  Lock,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
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
    bkashNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const product = {
    name: "Chemouflage AR Chemistry Cards",
    price: 199,
    originalPrice: 299,
    deliveryCharge: 60,
    image: "🧪",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      } // Prepare order data
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
          ...(paymentMethod === "bkash" && {
            bkashNumber: formData.bkashNumber,
          }),
        },
        items: [
          {
            product_id: "chemouflage-ar-cards", // This should come from actual product data
            quantity: 1,
            price: product.price,
          },
        ],
      };

      const { data, error } = await ordersService.createOrder(orderData);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data?.id} has been placed. You will receive tracking details soon.`,
      });

      navigate("/");
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

  const totalAmount = product.price + product.deliveryCharge;

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
                Secure Checkout
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your information is protected with 256-bit SSL encryption
              </CardDescription>
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

                <Separator className="bg-teal-500/30" />

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Payment Method
                  </h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label
                        htmlFor="bkash"
                        className="text-white flex items-center cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 mr-2 text-pink-400" />
                        bKash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                      <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                      <Label
                        htmlFor="sslcommerz"
                        className="text-white flex items-center cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
                        SSLCommerz (Card/Mobile Banking)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label
                        htmlFor="cod"
                        className="text-white flex items-center cursor-pointer"
                      >
                        <Banknote className="w-4 h-4 mr-2 text-emerald-400" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "bkash" && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="bkashNumber" className="text-white">
                        bKash Number
                      </Label>
                      <Input
                        id="bkashNumber"
                        name="bkashNumber"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.bkashNumber}
                        onChange={handleInputChange}
                        required
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading
                    ? "Processing..."
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-teal-900/20 rounded-lg">
                <div className="text-4xl">{product.image}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-gray-300 text-sm">
                    AR-Based Chemistry Learning Cards
                  </p>
                  <p className="text-gray-300 text-sm">
                    Interactive 3D Molecular Visualization
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    ৳{product.price}
                  </div>
                  <div className="text-gray-400 text-sm line-through">
                    ৳{product.originalPrice}
                  </div>
                </div>
              </div>

              <Separator className="bg-teal-500/30" />

              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Product Price</span>
                  <span>৳{product.originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Discount (33% OFF)</span>
                  <span>-৳{product.originalPrice - product.price}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Charge</span>
                  <span>৳{product.deliveryCharge}</span>
                </div>
              </div>

              <Separator className="bg-teal-500/30" />

              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>৳{totalAmount}</span>
              </div>

              <div className="mt-4">
                <Badge className="bg-emerald-600 text-white mb-2">
                  Limited Time Offer - 33% OFF
                </Badge>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• AR-based 3D molecular visualization</p>
                  <p>• Interactive chemistry simulations</p>
                  <p>• Educational card deck (50+ cards)</p>
                  <p>• Mobile app compatibility</p>
                  <p>• Premium access codes included</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-4">
                🔒 Your payment information is secure and encrypted. Order
                tracking will be available after purchase.
              </div>
            </CardContent>
          </Card>{" "}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
