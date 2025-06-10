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
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const orderId = searchParams.get("order_id");
  const transactionId = searchParams.get("transaction_id");
  const error = searchParams.get("error") || "Payment processing failed";
  const reason = searchParams.get("reason") || "unknown";

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
        // Don't show error toast as order might not exist yet
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

  const handleRetryPayment = async () => {
    if (!orderId) {
      toast({
        title: "Cannot Retry",
        description: "No order ID available for payment retry",
        variant: "destructive",
      });
      return;
    }

    try {
      setRetrying(true);
      // Navigate back to checkout with order details or trigger payment retry
      toast({
        title: "Redirecting",
        description: "Taking you to retry payment...",
      });

      // You could implement a retry payment endpoint here
      // For now, redirect to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast({
        title: "Retry Failed",
        description: "Unable to retry payment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  const getErrorMessage = (errorType: string, reason: string) => {
    switch (reason) {
      case "payment_failed":
        return "Your payment could not be processed. This may be due to insufficient funds, expired card, or network issues.";
      case "payment_cancelled":
        return "The payment was cancelled before completion.";
      case "timeout":
        return "The payment session timed out. Please try again.";
      case "invalid_transaction":
        return "The transaction details were invalid or corrupted.";
      default:
        return (
          errorType || "An unexpected error occurred during payment processing."
        );
    }
  };

  const getRecommendedActions = (reason: string) => {
    switch (reason) {
      case "payment_failed":
        return [
          "Check your account balance or card validity",
          "Ensure your card supports online transactions",
          "Try using a different payment method",
          "Contact your bank if the issue persists",
        ];
      case "timeout":
        return [
          "Check your internet connection",
          "Try again with a stable network",
          "Clear your browser cache and cookies",
          "Contact support if timeouts continue",
        ];
      default:
        return [
          "Try the payment again in a few minutes",
          "Check your internet connection",
          "Contact our support team for assistance",
          "Try using a different payment method",
        ];
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900 flex items-center justify-center">
        <div className="text-foreground text-lg">
          Loading payment details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {" "}
          {/* Back Button */}{" "}
          <Button
            variant="ghost"
            className="text-foreground hover:text-accent-foreground mb-6 dark:bg-white dark:text-gray-800"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          {/* Failed Header */}
          <Card className="bg-background/80 backdrop-blur-lg border-red-500/30 mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Payment Failed
                </h1>
                <p className="text-muted-foreground text-lg mb-4">
                  We couldn't process your payment. Don't worry, your order can
                  still be completed.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  {orderId && (
                    <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
                      Order #{orderId.slice(-8).toUpperCase()}
                    </Badge>
                  )}
                  {transactionId && (
                    <Badge className="bg-gray-600 hover:bg-gray-700 text-white">
                      Transaction: {transactionId}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Error Details */}
          <Alert className="bg-red-500/10 dark:bg-red-900/20 border-red-500/30 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              <strong>Error:</strong> {getErrorMessage(error, reason)}
            </AlertDescription>
          </Alert>{" "}
          {/* Order Details (if available) */}
          {orderDetails && (
            <Card className="bg-background/80 backdrop-blur-lg border-border mb-6">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Order Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your order has been created but payment is pending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <span>Payment Status:</span>
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">
                    {orderDetails.payment_status || "Failed"}
                  </Badge>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Amount:</span>
                  <span className="text-orange-500 dark:text-orange-400">
                    ৳{orderDetails.total_amount}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}{" "}
          {/* Recommended Actions */}
          <Card className="bg-background/80 backdrop-blur-lg border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                What can you do?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getRecommendedActions(reason).map((action, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 mt-2"></div>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Payment Options */}
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Try Again
              </CardTitle>
              <CardDescription className="text-gray-300">
                You can retry the payment or choose a different payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 mb-2">
                  Option 1: Retry Payment
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  Try the same payment method again. Sometimes temporary issues
                  resolve quickly.
                </p>
                <Button
                  onClick={handleRetryPayment}
                  disabled={retrying || !orderId}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {retrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Payment
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-green-300 mb-2">
                  Option 2: New Order
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  Start fresh with a new order and try a different payment
                  method.
                </p>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link to="/checkout">
                    <CreditCard className="w-4 h-4 mr-2" />
                    New Order
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            {" "}
            <Button
              asChild
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>{" "}
            <Button
              asChild
              variant="outline"
              className="border-teal-500/50 text-teal-300 hover:bg-teal-900/20 dark:bg-white dark:text-gray-800"
            >
              <Link to="/track-order">Track Your Orders</Link>
            </Button>
          </div>
          {/* Support Information */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Still having trouble? Contact our support team at{" "}
              <a
                href="mailto:support@chemouflage.com"
                className="text-teal-400 hover:text-teal-300"
              >
                support@chemouflage.com
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Include your order ID and transaction ID (if available) for faster
              assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
