import { OrderEditModal } from "@/components/OrderEditModal";
import PremiumCodeManagement from "@/components/PremiumCodeManagement";
import ProductManagement from "@/components/ProductManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services";
import { Order } from "@/services/types";
import {
  ArrowLeft,
  DollarSign,
  Edit,
  FlaskConical,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersPage, setCustomersPage] = useState(0);
  const [customersLimit] = useState(20);
  // Orders management state
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersLimit] = useState(20);

  // Order editing modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderEditModalOpen, setIsOrderEditModalOpen] = useState(false);
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isLoading, navigate]);
  useEffect(() => {
    if (activeTab === "customers" && isAdmin) {
      fetchCustomers();
    }
  }, [activeTab, isAdmin, customersPage]);

  useEffect(() => {
    if (activeTab === "orders" && isAdmin) {
      fetchAllOrders();
    }
  }, [activeTab, isAdmin, ordersPage]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } =
        await adminService.getDashboardStats();

      if (statsError) {
        throw new Error(statsError);
      }

      // Fetch recent orders
      const { data: ordersData, error: ordersError } =
        await adminService.getRecentOrders(10);

      if (ordersError) {
        throw new Error(ordersError);
      }

      if (statsData) {
        setStats(statsData);
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);

      // Fetch customers/users with pagination
      const { data: customersData, error: customersError } =
        await adminService.getAllUsers(
          customersPage * customersLimit,
          customersLimit
        );

      if (customersError) {
        throw new Error(customersError);
      }

      setCustomers(customersData || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setCustomersLoading(false);
    }
  };
  const fetchAllOrders = async () => {
    try {
      setOrdersLoading(true);

      // Fetch all orders with pagination
      const { data: ordersData, error: ordersError } =
        await adminService.getAllOrders(ordersPage * ordersLimit, ordersLimit);

      if (ordersError) {
        throw new Error(ordersError);
      }

      setAllOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderEditModalOpen(true);
  };

  const handleOrderUpdated = () => {
    fetchAllOrders(); // Refresh the orders list
  };

  const handleCloseOrderModal = () => {
    setIsOrderEditModalOpen(false);
    setSelectedOrder(null);
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
              <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                Go Home
              </Button>
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
      trend: "up",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      change: "+15.3%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: "+4.1%",
      icon: Users,
      trend: "up",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:text-teal-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
          </div>
          <div className="text-white">Welcome back, {user?.email}</div>
        </div>{" "}
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {[
            "overview",
            "products",
            "orders",
            "customers",
            "premium-codes",
            "settings",
          ].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "text-white hover:bg-teal-900/50"
              }
            >
              {tab === "premium-codes"
                ? "Premium Codes"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="text-sm text-emerald-400">
                          {stat.change} from last month
                        </p>
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
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <ShoppingCart className="w-5 h-5 text-teal-400" />{" "}
                        <div>
                          <p className="text-white font-semibold">
                            Order #{order.id.substring(0, 8)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Customer Order
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-semibold">
                          ৳{order.total_amount}
                        </span>
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
        )}{" "}
        {/* Products Tab */}
        {activeTab === "products" && <ProductManagement />}
        {/* Premium Codes Tab */}
        {activeTab === "premium-codes" && <PremiumCodeManagement />}{" "}
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Order Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage all customer orders and delivery status
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchAllOrders}
                  variant="outline"
                  className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                  disabled={ordersLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      ordersLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white">Loading orders...</div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {allOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No orders found</p>
                      </div>
                    ) : (
                      allOrders.map((order: any) => (
                        <div
                          key={order.id}
                          className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <ShoppingCart className="w-5 h-5 text-teal-400" />
                              <div>
                                <p className="text-white font-semibold">
                                  Order #{order.id.substring(0, 8)}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  Customer: {order.shipping_address?.firstName}{" "}
                                  {order.shipping_address?.lastName}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}{" "}
                                  • {order.payment_method}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  Phone: {order.shipping_address?.phone}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex items-center space-x-4">
                              <div>
                                <p className="text-white font-semibold text-lg mb-2">
                                  ৳{order.total_amount}
                                </p>
                                <div className="flex flex-col space-y-1">
                                  <Badge
                                    className={`
                                    ${
                                      order.status === "pending"
                                        ? "bg-yellow-600"
                                        : order.status === "processing"
                                        ? "bg-blue-600"
                                        : order.status === "shipped"
                                        ? "bg-purple-600"
                                        : order.status === "delivered"
                                        ? "bg-green-600"
                                        : order.status === "cancelled"
                                        ? "bg-red-600"
                                        : "bg-gray-600"
                                    } text-white text-xs
                                  `}
                                  >
                                    {order.status?.charAt(0).toUpperCase() +
                                      order.status?.slice(1)}
                                  </Badge>
                                  <Badge
                                    className={`
                                    ${
                                      order.payment_status === "pending"
                                        ? "bg-yellow-500"
                                        : order.payment_status === "paid"
                                        ? "bg-green-500"
                                        : order.payment_status === "failed"
                                        ? "bg-red-500"
                                        : order.payment_status === "refunded"
                                        ? "bg-gray-500"
                                        : "bg-gray-600"
                                    } text-white text-xs
                                  `}
                                  >
                                    Pay:{" "}
                                    {order.payment_status
                                      ?.charAt(0)
                                      .toUpperCase() +
                                      order.payment_status?.slice(1)}
                                  </Badge>
                                  <Badge
                                    className={`
                                    ${
                                      order.delivery_status === "pending"
                                        ? "bg-yellow-500"
                                        : order.delivery_status === "preparing"
                                        ? "bg-blue-500"
                                        : order.delivery_status === "shipped"
                                        ? "bg-purple-500"
                                        : order.delivery_status === "delivered"
                                        ? "bg-green-500"
                                        : "bg-gray-600"
                                    } text-white text-xs
                                  `}
                                  >
                                    Del:{" "}
                                    {order.delivery_status
                                      ?.charAt(0)
                                      .toUpperCase() +
                                      order.delivery_status?.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleEditOrder(order)}
                                variant="outline"
                                size="sm"
                                className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <div className="mt-3 pt-3 border-t border-teal-500/30">
                              <p className="text-gray-300 text-sm">
                                <strong>Address:</strong>{" "}
                                {order.shipping_address.address},{" "}
                                {order.shipping_address.area},{" "}
                                {order.shipping_address.city}
                                {order.shipping_address.zipCode &&
                                  ` - ${order.shipping_address.zipCode}`}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {allOrders.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-teal-500/30">
                      <Button
                        onClick={() =>
                          setOrdersPage(Math.max(0, ordersPage - 1))
                        }
                        disabled={ordersPage === 0 || ordersLoading}
                        variant="outline"
                        className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                      >
                        Previous
                      </Button>
                      <span className="text-gray-300">
                        Page {ordersPage + 1}
                      </span>
                      <Button
                        onClick={() => setOrdersPage(ordersPage + 1)}
                        disabled={
                          allOrders.length < ordersLimit || ordersLoading
                        }
                        variant="outline"
                        className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
        {/* Customers Tab */}
        {activeTab === "customers" && (
          <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    Customer Management
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage customer accounts and information
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchCustomers}
                  variant="outline"
                  className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                  disabled={customersLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      customersLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white">Loading customers...</div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {customers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg border border-teal-500/30"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.full_name?.charAt(0) ||
                              customer.email?.charAt(0).toUpperCase() ||
                              customer.id.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {customer.full_name || customer.email}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {customer.email}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {customer.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white">
                          {customer.role || "customer"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-teal-500/30">
                    <div className="text-sm text-gray-300">
                      Page {customersPage + 1} • Showing {customers.length}{" "}
                      customers
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCustomersPage(Math.max(0, customersPage - 1))
                        }
                        disabled={customersPage === 0 || customersLoading}
                        className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomersPage(customersPage + 1)}
                        disabled={
                          customers.length < customersLimit || customersLoading
                        }
                        className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
        {/* Settings Tab */}
        {activeTab === "settings" && (
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
                  <h3 className="text-white font-semibold mb-2">
                    Payment Methods
                  </h3>
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
                  <h3 className="text-white font-semibold mb-2">
                    Social Login
                  </h3>
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

      {/* Order Edit Modal */}
      <OrderEditModal
        order={selectedOrder}
        isOpen={isOrderEditModalOpen}
        onClose={handleCloseOrderModal}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default AdminDashboard;
