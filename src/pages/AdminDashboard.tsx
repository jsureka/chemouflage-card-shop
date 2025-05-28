
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProductManagement from '@/components/ProductManagement';
import { 
  ArrowLeft, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3,
  FlaskConical,
  Settings,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch customers
      const { data: customersData } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .limit(10);

      // Calculate revenue from orders
      const totalRevenue = ordersData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        totalCustomers: customersData?.length || 0
      });

      setOrders(ordersData || []);
      setCustomers(customersData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center">
        <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-300">
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      change: "+12.5%",
      icon: Package,
      trend: "up"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      change: "+15.3%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: "+4.1%",
      icon: Users,
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-teal-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
          </div>
          <div className="text-white">
            Welcome back, {user?.email}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {['overview', 'products', 'orders', 'customers', 'settings'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab 
                ? "bg-teal-600 hover:bg-teal-700" 
                : "text-white hover:bg-teal-900/50"
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
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-emerald-400">{stat.change} from last month</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-teal-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <ShoppingCart className="w-5 h-5 text-teal-400" />
                        <div>
                          <p className="text-white font-semibold">{order.id.substring(0, 8)}</p>
                          <p className="text-gray-400 text-sm">{order.profiles?.full_name || 'Customer'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-semibold">৳{order.total_amount}</span>
                        <Badge className="bg-teal-600 text-white">
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

        {/* Products Tab */}
        {activeTab === 'products' && <ProductManagement />}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage all customer orders and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-gray-400 text-sm">{order.profiles?.full_name || 'Customer'}</p>
                        <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">৳{order.total_amount}</p>
                        <Badge className="bg-teal-600 text-white">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white">Customer Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage customer accounts and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.full_name?.charAt(0) || customer.id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{customer.full_name || 'Customer'}</p>
                        <p className="text-gray-400 text-sm">{customer.phone || 'No phone'}</p>
                        <p className="text-gray-400 text-sm">
                          Joined: {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white">
                      {customer.user_roles?.[0]?.role || 'customer'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
                  <h3 className="text-white font-semibold mb-2">Payment Methods</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">bKash</span>
                      <Badge className="bg-emerald-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Google Pay (OAuth)</span>
                      <Badge className="bg-emerald-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Cash on Delivery</span>
                      <Badge className="bg-emerald-600">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
                  <h3 className="text-white font-semibold mb-2">Social Login</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Google OAuth</span>
                      <Badge className="bg-emerald-600">Configured</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
