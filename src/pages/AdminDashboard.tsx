
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  Truck,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  // Mock data - replace with real data from Supabase
  const stats = [
    {
      title: "Total Revenue",
      value: "৳1,23,450",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Total Orders",
      value: "245",
      change: "+8.2%",
      icon: Package,
      trend: "up"
    },
    {
      title: "Active Customers",
      value: "1,234",
      change: "+4.1%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Pending Deliveries",
      value: "32",
      change: "-2.1%",
      icon: Truck,
      trend: "down"
    }
  ];

  const customers = [
    { 
      id: 1, 
      name: "রাহুল আহমেদ", 
      email: "rahul@example.com", 
      phone: "01712345678",
      role: "customer", 
      status: "active",
      totalOrders: 3,
      totalSpent: 597
    },
    { 
      id: 2, 
      name: "ফাতিমা খান", 
      email: "fatima@example.com", 
      phone: "01812345678",
      role: "customer", 
      status: "active",
      totalOrders: 1,
      totalSpent: 259
    },
    { 
      id: 3, 
      name: "করিম উদ্দিন", 
      email: "karim@example.com", 
      phone: "01912345678",
      role: "customer", 
      status: "inactive",
      totalOrders: 0,
      totalSpent: 0
    },
  ];

  const orders = [
    { 
      id: "CHM-001", 
      customer: "রাহুল আহমেদ", 
      phone: "01712345678",
      amount: 259, 
      status: "delivered", 
      paymentMethod: "bKash",
      address: "বাড়ি-১২, রোড-৫, ধানমন্ডি, ঢাকা",
      date: "2024-01-15",
      trackingId: "DHL123456789"
    },
    { 
      id: "CHM-002", 
      customer: "ফাতিমা খান", 
      phone: "01812345678",
      amount: 259, 
      status: "shipped", 
      paymentMethod: "SSLCommerz",
      address: "ফ্ল্যাট-৩এ, গুলশান-২, ঢাকা",
      date: "2024-01-14",
      trackingId: "DHL123456790"
    },
    { 
      id: "CHM-003", 
      customer: "রাহুল আহমেদ", 
      phone: "01712345678",
      amount: 259, 
      status: "processing", 
      paymentMethod: "Cash on Delivery",
      address: "বাড়ি-১২, রোড-৫, ধানমন্ডি, ঢাকা",
      date: "2024-01-13",
      trackingId: "CHM003PROC"
    },
    { 
      id: "CHM-004", 
      customer: "সানিয়া রহমান", 
      phone: "01612345678",
      amount: 259, 
      status: "pending", 
      paymentMethod: "bKash",
      address: "রোড-২৭, বনানী, ঢাকা",
      date: "2024-01-12",
      trackingId: "CHM004PEND"
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-300">
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-600';
      case 'shipped': return 'bg-blue-600';
      case 'processing': return 'bg-yellow-600';
      case 'pending': return 'bg-orange-600';
      case 'cancelled': return 'bg-red-600';
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="text-white">
            Welcome back, {user?.name}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {['overview', 'orders', 'customers', 'settings'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "text-white hover:bg-white/10"
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <stat.icon className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="text-white font-semibold">{order.id}</p>
                          <p className="text-gray-400 text-sm">{order.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-semibold">৳{order.amount}</span>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage all customer orders, tracking, and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="text-white font-semibold">{order.id}</p>
                          <p className="text-gray-400 text-sm">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-600 text-white">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.id}</DialogTitle>
                              <DialogDescription className="text-gray-300">
                                Complete order information and tracking details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-gray-300">Customer</Label>
                                  <p className="text-white">{order.customer}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-300">Phone</Label>
                                  <p className="text-white">{order.phone}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-gray-300">Delivery Address</Label>
                                <p className="text-white">{order.address}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-gray-300">Amount</Label>
                                  <p className="text-white">৳{order.amount}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-300">Payment Method</Label>
                                  <p className="text-white">{order.paymentMethod}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-gray-300">Tracking ID</Label>
                                <p className="text-white">{order.trackingId}</p>
                              </div>
                              <div>
                                <Label className="text-gray-300">Update Status</Label>
                                <Select>
                                  <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder={order.status} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 mr-2" />
                        {order.customer}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.phone}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ৳{order.amount}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {order.address}
                    </div>
                    <div className="mt-2 text-gray-400 text-sm">
                      Tracking: {order.trackingId}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Customer Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage customer accounts, contact information, and order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{customer.name}</p>
                        <p className="text-gray-400 text-sm">{customer.email}</p>
                        <p className="text-gray-400 text-sm">{customer.phone}</p>
                        <p className="text-gray-400 text-sm">
                          {customer.totalOrders} orders • ৳{customer.totalSpent} total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(customer.status)} text-white`}>
                        {customer.status}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-400">
                        {customer.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Delivery Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage delivery charges and shipping options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryCharge" className="text-white">
                      Delivery Charge (৳)
                    </Label>
                    <Input
                      id="deliveryCharge"
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Update Delivery Charge
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Payment Methods</CardTitle>
                <CardDescription className="text-gray-300">
                  Available payment options for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">bKash</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">SSLCommerz</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">Cash on Delivery</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
