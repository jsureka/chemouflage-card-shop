import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ordersService } from "@/services";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Home,
  Info,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("order_id");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await ordersService.getOrderById(orderId!);

      if (error) {
        console.error("Error fetching order:", error);
        // Don't show error toast as the order might be in a pending state
      }

      if (data) {
        setOrderDetails(data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleRetryPayment = () => {
    // Navigate back to checkout to retry the order
    navigate("/checkout");
    toast({
      title: "Ready to retry",
      description:
        "You can now complete your purchase with any payment method.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-white hover:text-teal-300 mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Cancelled Header */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-orange-500/30 mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                  <XCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Payment Cancelled
                </h1>
                <p className="text-gray-300 text-lg mb-4">
                  You chose to cancel the payment process. Your order is still
                  available for completion.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  {orderId && (
                    <Badge className="bg-orange-600 text-white">
                      Order #{orderId.slice(-8).toUpperCase()}
                    </Badge>
                  )}
                  {transactionId && (
                    <Badge className="bg-gray-600 text-white">
                      Transaction: {transactionId}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert className="bg-blue-900/20 border-blue-500/30 mb-6">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>No charges were made.</strong> Since you cancelled the
              payment, your payment method was not charged.
            </AlertDescription>
          </Alert>

          {/* Order Details (if available) */}
          {orderDetails && (
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your order is on hold and can be completed anytime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Order ID:</span>
                  <span className="font-mono text-white">
                    #{orderDetails.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Created:</span>
                  <span className="text-white">
                    {new Date(orderDetails.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Payment Status:</span>
                  <Badge className="bg-orange-600 text-white">
                    {orderDetails.payment_status || "Cancelled"}
                  </Badge>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Amount:</span>
                  <span className="text-orange-400">
                    ৳{orderDetails.total_amount}
                  </span>
                </div>
                <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                  <p className="text-orange-300 text-sm">
                    💡 Your order will be held for 24 hours. You can complete
                    the payment anytime during this period.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What happened */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white">What Happened?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400 mt-2"></div>
                <div>
                  <p className="text-gray-300">
                    You cancelled the payment during the AamarPay checkout
                    process
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                <div>
                  <p className="text-gray-300">
                    No money was deducted from your account
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <div>
                  <p className="text-gray-300">
                    Your order details have been saved and are ready for
                    completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Options */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Complete Your Order</CardTitle>
              <CardDescription className="text-gray-300">
                Ready to finish your purchase? Choose an option below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-green-300 mb-2">
                  Complete Payment
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  Continue with your Chemistry AR Cards order. You can use any
                  available payment method.
                </p>
                <Button
                  onClick={handleRetryPayment}
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Payment
                </Button>
              </div>

              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 mb-2">
                  Browse More Products
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  Explore our other educational products and chemistry learning
                  materials.
                </p>
                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-900/20 w-full sm:w-auto"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-teal-500/50 text-teal-300 hover:bg-teal-900/20"
            >
              <Link to="/track-order">Track Your Orders</Link>
            </Button>
          </div>

          {/* Help Information */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Need help completing your order? Contact us at{" "}
              <a
                href="mailto:support@chemouflage.com"
                className="text-teal-400 hover:text-teal-300"
              >
                support@chemouflage.com
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Our team is here to help you complete your purchase successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
