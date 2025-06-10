import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersService } from "@/services";
import { OrderWithItems } from "@/services/types";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Eye,
  MapPin,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your orders.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (user) {
      fetchMyOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await ordersService.getUserOrders();

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchMyOrders();
      toast({
        title: "Refreshed",
        description: "Your orders have been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (
    status: string,
    type: "status" | "payment" | "delivery"
  ) => {
    let bgColor = "bg-gray-600";
    let textColor = "text-white";

    if (type === "status") {
      switch (status?.toLowerCase()) {
        case "pending":
          bgColor = "bg-yellow-600";
          break;
        case "processing":
          bgColor = "bg-blue-600";
          break;
        case "shipped":
          bgColor = "bg-purple-600";
          break;
        case "delivered":
          bgColor = "bg-green-600";
          break;
        case "cancelled":
          bgColor = "bg-red-600";
          break;
      }
    } else if (type === "payment") {
      switch (status?.toLowerCase()) {
        case "pending":
          bgColor = "bg-yellow-500";
          break;
        case "paid":
          bgColor = "bg-green-500";
          break;
        case "failed":
          bgColor = "bg-red-500";
          break;
        case "refunded":
          bgColor = "bg-gray-500";
          break;
      }
    } else if (type === "delivery") {
      switch (status?.toLowerCase()) {
        case "pending":
          bgColor = "bg-yellow-500";
          break;
        case "preparing":
          bgColor = "bg-blue-500";
          break;
        case "shipped":
          bgColor = "bg-purple-500";
          break;
        case "delivered":
          bgColor = "bg-green-500";
          break;
      }
    }

    const prefix =
      type === "payment" ? "Pay: " : type === "delivery" ? "Del: " : "";
    const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);

    return (
      <Badge className={`${bgColor} ${textColor} text-xs`}>
        {prefix}
        {displayStatus}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="inline-flex items-center text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>{/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">My Orders</h1>
          <p className="text-muted-foreground text-lg">
            Track and manage your Chemouflage orders
          </p>
        </div>        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="bg-background/80 backdrop-blur-lg border border-border max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground text-xl font-semibold mb-2">
                No Orders Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your
                orders here!
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-background/80 backdrop-blur-lg border border-border"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-foreground">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Placed on {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                      {getStatusBadge(order.status, "status")}
                      {order.payment_status &&
                        getStatusBadge(order.payment_status, "payment")}
                      {order.delivery_status &&
                        getStatusBadge(order.delivery_status, "delivery")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {" "}
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Payment:</span>
                        <span className="text-foreground font-medium">
                          {order.payment_method}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Order Date:</span>
                        <span className="text-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="text-foreground font-bold text-lg">
                          ৳{order.total_amount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Delivery Charge:</span>
                        <span className="text-foreground">
                          ৳{order.delivery_charge}
                        </span>
                      </div>
                    </div>
                  </div>                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="p-4 bg-background/40 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">
                          Order Items
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="flex justify-between items-center p-2 bg-muted/50 rounded"
                          >
                            <div>
                              <p className="text-foreground font-medium">
                                {item.product_name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                Quantity: {item.quantity} × ৳{item.price}
                              </p>
                            </div>
                            <div className="text-foreground font-semibold">
                              ৳{item.quantity * item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="p-4 bg-background/40 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">
                          Delivery Address
                        </span>
                      </div>
                      <div className="text-muted-foreground space-y-1">
                        <p className="text-foreground">
                          {order.shipping_address.firstName}{" "}
                          {order.shipping_address.lastName}
                        </p>
                        <p>{order.shipping_address.phone}</p>
                        <p>
                          {order.shipping_address.address},{" "}
                          {order.shipping_address.area}
                        </p>
                        <p>
                          {order.shipping_address.city}
                          {order.shipping_address.zipCode &&
                            ` - ${order.shipping_address.zipCode}`}
                        </p>
                      </div>
                    </div>
                  )}{" "}                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Button
                      asChild
                      variant="outline"
                      className="border-border hover:bg-muted"
                    >
                      <Link to={`/track/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Track Order
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            Need help with your order?{" "}
            <Link
              to="/contact"
              className="text-primary hover:text-primary/80 underline"
            >
              Contact Support
            </Link>          </p>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
