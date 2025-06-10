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
import { useToast } from "@/hooks/use-toast";
import { ordersService } from "@/services";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const OrderTracking = () => {
  const { orderId: routeOrderId } = useParams();
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState(routeOrderId || "");
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-track if order ID is provided via route
  useEffect(() => {
    if (routeOrderId) {
      handleTrackOrder(routeOrderId);
    }
  }, [routeOrderId]);

  const handleTrackOrder = async (orderIdToTrack?: string) => {
    const idToUse = orderIdToTrack || trackingId;
    if (!idToUse.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await ordersService.trackOrder(idToUse.trim());

      if (error) {
        console.error("Track order error:", error);
        setOrderData(null);
        toast({
          title: "Order Not Found",
          description: `We couldn't find an order with the ID "${idToUse}". Please check your order ID or tracking number and try again.`,
          variant: "destructive",
        });
      } else if (data) {
        // Transform backend data to match the expected format
        const transformedData = {
          id: data.id,
          trackingId: data.id.slice(-8).toUpperCase(),
          customer: `${data.shipping_address.firstName} ${data.shipping_address.lastName}`,
          phone: data.shipping_address.phone,
          status: data.status || "pending",
          amount: data.total_amount,
          deliveryCharge: data.delivery_charge,
          items: data.items || [],
          paymentMethod: data.payment_method || "N/A",
          address: `${data.shipping_address.address}, ${data.shipping_address.area}, ${data.shipping_address.city}`,
          orderDate: new Date(data.created_at).toLocaleDateString(),
          estimatedDelivery: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          timeline: generateTimeline(data.status || "pending", data.created_at),
        };
        setOrderData(transformedData);
        toast({
          title: "Order Found!",
          description: `Successfully loaded order #${transformedData.trackingId}`,
        });
      } else {
        setOrderData(null);
        toast({
          title: "Order Not Found",
          description: `We couldn't find an order with the ID "${idToUse}". Please check your order ID or tracking number and try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setOrderData(null);
      toast({
        title: "Network Error",
        description:
          "There was an error connecting to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeline = (status: string, createdAt: string) => {
    const baseTimeline = [
      {
        status: "Order Placed",
        date: new Date(createdAt).toLocaleString(),
        completed: true,
      },
      {
        status: "Payment Confirmed",
        date: new Date(createdAt).toLocaleString(),
        completed: true,
      },
      { status: "Processing", date: "Pending", completed: false },
      { status: "Shipped", date: "Pending", completed: false },
      { status: "Out for Delivery", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ];

    switch (status.toLowerCase()) {
      case "processing":
        baseTimeline[2].completed = true;
        baseTimeline[2].date = new Date().toLocaleString();
        break;
      case "shipped":
        baseTimeline[2].completed = true;
        baseTimeline[3].completed = true;
        baseTimeline[3].date = new Date().toLocaleString();
        break;
      case "delivered":
        baseTimeline.forEach((step, index) => {
          if (index < 6) {
            step.completed = true;
            if (step.date === "Pending") {
              step.date = new Date().toLocaleString();
            }
          }
        });
        break;
    }

    return baseTimeline;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-600";
      case "shipped":
      case "out for delivery":
        return "bg-blue-600";
      case "processing":
        return "bg-yellow-600";
      case "order placed":
      case "payment confirmed":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-background/80 backdrop-blur-lg border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Track Your Order
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your order ID or tracking number to track your Chemouflage
                AR Chemistry Cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="trackingId" className="text-foreground">
                    Order ID or Tracking Number
                  </Label>
                  <Input
                    id="trackingId"
                    placeholder="e.g., 12345678 or full order ID"
                    value={trackingId}
                    onChange={(e) => {
                      setTrackingId(e.target.value);
                      // Reset search state when user types
                      if (hasSearched) {
                        setHasSearched(false);
                        setOrderData(null);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && trackingId && !isLoading) {
                        handleTrackOrder();
                      }
                    }}
                    className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground mt-2"
                  />
                </div>
                <Button
                  onClick={() => handleTrackOrder()}
                  disabled={!trackingId || isLoading}
                  className="bg-primary hover:bg-primary/90 mt-8"
                >
                  {isLoading ? "Tracking..." : "Track Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
          {orderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="bg-background/80 backdrop-blur-lg border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Order ID
                        </Label>
                        <p className="text-foreground font-semibold">
                          #{orderData.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Tracking ID
                        </Label>
                        <p className="text-foreground font-semibold">
                          #{orderData.trackingId}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Order Date
                        </Label>
                        <p className="text-foreground">{orderData.orderDate}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Estimated Delivery
                        </Label>
                        <p className="text-foreground">
                          {orderData.estimatedDelivery}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {orderData.customer}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {orderData.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {orderData.address}
                        </span>
                      </div>
                      <div>
                        <Badge
                          className={`${getStatusColor(
                            orderData.status
                          )} text-white`}
                        >
                          {orderData.status.charAt(0).toUpperCase() +
                            orderData.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Order Timeline */}
              <Card className="bg-background/80 backdrop-blur-lg border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Order Timeline
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track the progress of your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderData.timeline.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? "bg-green-600" : "bg-gray-600"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              step.completed
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.status}
                          </p>
                          <p
                            className={`text-sm ${
                              step.completed
                                ? "text-muted-foreground"
                                : "text-muted-foreground/60"
                            }`}
                          >
                            {step.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Product Details */}
              <Card className="bg-background/80 backdrop-blur-lg border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  {orderData.items && orderData.items.length > 0 ? (
                    <div className="space-y-3">
                      {orderData.items.map((item: any, index: number) => (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between p-4 bg-background/40 border border-border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">🧪</div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {item.product_name}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Quantity: {item.quantity} × ৳{item.price}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-foreground font-semibold">
                              ৳{item.quantity * item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 p-4 bg-background/40 border border-border rounded-lg">
                      <div className="text-4xl">🧪</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          Chemouflage AR Chemistry Cards
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          AR-Based Chemistry Learning Cards
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Interactive 3D Molecular Visualization
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-foreground font-semibold">
                          ৳{orderData.amount}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {orderData.paymentMethod}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>
                          ৳{orderData.amount - (orderData.deliveryCharge || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Charge:</span>
                        <span>৳{orderData.deliveryCharge || 0}</span>
                      </div>
                      <div className="flex justify-between text-foreground font-semibold text-lg border-t border-border pt-2">
                        <span>Total:</span>
                        <span>৳{orderData.amount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-sm">
                        <span>Payment Method:</span>
                        <span>{orderData.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {hasSearched && trackingId && !orderData && !isLoading && (
            <Card className="bg-background/80 backdrop-blur-lg border border-border">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-foreground text-lg font-semibold mb-2">
                  Order Not Found
                </h3>
                <p className="text-muted-foreground">
                  We couldn't find an order with the tracking ID "{trackingId}".
                  Please check your order ID or tracking number and try again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
