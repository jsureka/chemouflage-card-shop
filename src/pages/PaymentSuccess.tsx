import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ordersService } from "@/services";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("order_id");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (!orderId) {
      toast({
        title: "Invalid Payment",
        description: "No order ID found in payment confirmation.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await ordersService.getOrderById(orderId!);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setOrderDetails(data);
      } else {
        throw new Error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900 flex items-center justify-center">
        <div className="text-foreground text-lg">
          Loading payment confirmation...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {" "}
          {/* Success Header */}
          <Card className="bg-background/80 backdrop-blur-lg border-border mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground text-lg mb-4">
                  Thank you for your purchase. Your order has been confirmed.
                </p>{" "}
                <div className="flex items-center justify-center space-x-4">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    Order #{orderId?.slice(-8).toUpperCase()}
                  </Badge>
                  {transactionId && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                      Transaction: {transactionId}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          {/* Order Details */}
          {orderDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Summary */}
              <Card className="bg-background/80 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Order ID:</span>
                    <span className="font-mono text-foreground">
                      #{orderDetails.id?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Order Date:</span>
                    <span className="text-foreground">
                      {new Date(orderDetails.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Method:</span>
                    <span className="text-foreground">
                      {orderDetails.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Status:</span>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      {orderDetails.payment_status || "Paid"}
                    </Badge>
                  </div>
                  <Separator className="bg-border" />{" "}
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total Amount:</span>
                    <span className="text-emerald-500 dark:text-emerald-400">
                      ৳{orderDetails.total_amount}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="bg-background/80 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transactionId && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-foreground text-sm">
                        {transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Date:</span>
                    <span className="text-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Gateway:</span>
                    <span className="text-foreground">AamarPay</span>
                  </div>
                  <div className="p-3 bg-green-500/10 dark:bg-green-900/20 rounded-lg border border-green-500/30">
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      ✅ Payment has been verified and confirmed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}{" "}
          {/* Delivery Information */}
          {orderDetails?.shipping_address && (
            <Card className="bg-background/80 backdrop-blur-lg border-border mb-6">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {orderDetails.shipping_address.firstName}{" "}
                    {orderDetails.shipping_address.lastName}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {orderDetails.shipping_address.address},{" "}
                    {orderDetails.shipping_address.area},{" "}
                    {orderDetails.shipping_address.city}
                  </span>
                </div>
                <div className="p-3 bg-blue-500/10 dark:bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Expected delivery: 2-3 business days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}{" "}
          {/* Next Steps */}
          <Card className="bg-background/80 backdrop-blur-lg border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">What's Next?</CardTitle>
              <CardDescription className="text-muted-foreground">
                Here's what you can expect after your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Order Processing
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    We're preparing your Chemistry AR Cards for shipment
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Premium Code Email
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    You'll receive premium access codes via email shortly
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Shipping Notification
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Track your order with the link we'll send you
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {" "}
            <Button
              asChild
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>{" "}
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-accent bg-background dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
            >
              <Link to="/my-orders">
                <Package className="w-4 h-4 mr-2" />
                View My Orders
              </Link>
            </Button>{" "}
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-accent bg-background dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
            >
              <Link to={`/track/${orderId}`}>
                <Package className="w-4 h-4 mr-2" />
                Track This Order
              </Link>
            </Button>
          </div>
          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@chemouflage.com"
                className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
              >
                support@chemouflage.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
