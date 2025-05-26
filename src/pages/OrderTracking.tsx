
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock order data
  const mockOrder = {
    id: "CHM-001",
    trackingId: "DHL123456789",
    customer: "রাহুল আহমেদ",
    phone: "01712345678",
    status: "shipped",
    amount: 259,
    paymentMethod: "bKash",
    address: "বাড়ি-১২, রোড-৫, ধানমন্ডি, ঢাকা-১২০৫",
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-18",
    timeline: [
      { status: "Order Placed", date: "2024-01-15 10:30 AM", completed: true },
      { status: "Payment Confirmed", date: "2024-01-15 10:35 AM", completed: true },
      { status: "Processing", date: "2024-01-15 02:00 PM", completed: true },
      { status: "Shipped", date: "2024-01-16 09:00 AM", completed: true },
      { status: "Out for Delivery", date: "Expected: 2024-01-18 10:00 AM", completed: false },
      { status: "Delivered", date: "Expected: 2024-01-18 06:00 PM", completed: false }
    ]
  };

  const handleTrackOrder = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (trackingId === "CHM-001" || trackingId === "DHL123456789") {
        setOrderData(mockOrder);
      } else {
        setOrderData(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-600';
      case 'shipped': 
      case 'out for delivery': return 'bg-blue-600';
      case 'processing': return 'bg-yellow-600';
      case 'order placed': 
      case 'payment confirmed': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-white hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Track Your Order
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter your order ID or tracking number to track your Chemouflage AR Chemistry Cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="trackingId" className="text-white">Order ID or Tracking Number</Label>
                  <Input
                    id="trackingId"
                    placeholder="CHM-001 or DHL123456789"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 mt-2"
                  />
                </div>
                <Button
                  onClick={handleTrackOrder}
                  disabled={!trackingId || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 mt-8"
                >
                  {isLoading ? "Tracking..." : "Track Order"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {orderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Order ID</Label>
                        <p className="text-white font-semibold">{orderData.id}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Tracking ID</Label>
                        <p className="text-white font-semibold">{orderData.trackingId}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Order Date</Label>
                        <p className="text-white">{orderData.orderDate}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Estimated Delivery</Label>
                        <p className="text-white">{orderData.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{orderData.customer}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{orderData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{orderData.address}</span>
                      </div>
                      <div>
                        <Badge className={`${getStatusColor(orderData.status)} text-white`}>
                          {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Order Timeline</CardTitle>
                  <CardDescription className="text-gray-300">
                    Track the progress of your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orderData.timeline.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                            {step.status}
                          </p>
                          <p className={`text-sm ${step.completed ? 'text-gray-300' : 'text-gray-500'}`}>
                            {step.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-4xl">🧪</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Chemouflage AR Chemistry Cards</h3>
                      <p className="text-gray-300 text-sm">AR-Based Chemistry Learning Cards</p>
                      <p className="text-gray-300 text-sm">Interactive 3D Molecular Visualization</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">৳{orderData.amount}</div>
                      <div className="text-gray-400 text-sm">{orderData.paymentMethod}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {trackingId && !orderData && !isLoading && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Order Not Found</h3>
                <p className="text-gray-300">
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
