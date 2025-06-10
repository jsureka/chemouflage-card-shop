import CloudinaryImage from "@/components/CloudinaryImage";
import { OrderEditModal } from "@/components/OrderEditModal";
import PremiumCodeManagement from "@/components/PremiumCodeManagement";
import ProductManagement from "@/components/ProductManagement";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  CustomersTab,
  OrdersTab,
  OverviewTab,
  SettingsTab,
} from "@/components/admin";
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
import { ArrowLeft } from "lucide-react";
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
  const [customersPagination, setCustomersPagination] = useState(null);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersPage, setCustomersPage] = useState(1);
  const [customersLimit, setCustomersLimit] = useState(20);
  // Orders management state
  const [allOrders, setAllOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(20);

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
  }, [activeTab, isAdmin, customersPage, customersLimit]);

  useEffect(() => {
    if (activeTab === "orders" && isAdmin) {
      fetchAllOrders();
    }
  }, [activeTab, isAdmin, ordersPage, ordersLimit]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } =
        await adminService.getDashboardStats();

      if (statsError) {
        throw new Error(statsError);
      } // Fetch recent orders
      const { data: ordersData, error: ordersError } =
        await adminService.getRecentOrders(10);

      if (ordersError) {
        throw new Error(ordersError);
      }

      if (statsData) {
        setStats(statsData);
      }

      // Handle paginated response for recent orders
      if (ordersData) {
        setOrders(ordersData.data || []);
      } else {
        setOrders([]);
      }
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
        await adminService.getAllUsers(customersPage, customersLimit);

      if (customersError) {
        throw new Error(customersError);
      }

      if (customersData) {
        setCustomers(customersData.data || []);
        setCustomersPagination(customersData.pagination);
      } else {
        setCustomers([]);
        setCustomersPagination(null);
      }
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
        await adminService.getAllOrders(ordersPage, ordersLimit);

      if (ordersError) {
        throw new Error(ordersError);
      }

      if (ordersData) {
        setAllOrders(ordersData.data || []);
        setOrdersPagination(ordersData.pagination);
      } else {
        setAllOrders([]);
        setOrdersPagination(null);
      }
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

  const handleOrdersPageSizeChange = (newSize: number) => {
    setOrdersLimit(newSize);
    setOrdersPage(1); // Reset to first page when changing page size
  };

  const handleCustomersPageSizeChange = (newSize: number) => {
    setCustomersLimit(newSize);
    setCustomersPage(1); // Reset to first page when changing page size
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="backdrop-blur-lg border-primary/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-foreground">Access Denied</CardTitle>
            <CardDescription className="text-muted-foreground">
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>{" "}
            <div className="flex items-center space-x-2">
              <CloudinaryImage
                fileName="logoRound_1_yn0smh.png"
                alt="Chemouflage Logo"
                className="w-8 h-8 object-contain"
                width={32}
                height={32}
              />
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-foreground">Welcome back, {user?.email}</div>
            <ThemeToggle />
          </div>
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
              className={activeTab === tab ? "" : "hover:bg-accent"}
            >
              {tab === "premium-codes"
                ? "Premium Codes"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>{" "}
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <OverviewTab stats={stats} orders={orders} />
        )}
        {/* Products Tab */}
        {activeTab === "products" && <ProductManagement />}
        {/* Premium Codes Tab */}
        {activeTab === "premium-codes" && <PremiumCodeManagement />}{" "}
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <OrdersTab
            allOrders={allOrders}
            ordersPagination={ordersPagination}
            ordersLoading={ordersLoading}
            ordersPage={ordersPage}
            ordersLimit={ordersLimit}
            onRefreshOrders={fetchAllOrders}
            onEditOrder={handleEditOrder}
            onSetOrdersPage={setOrdersPage}
            onSetOrdersPageSize={handleOrdersPageSizeChange}
          />
        )}{" "}
        {/* Customers Tab */}
        {activeTab === "customers" && (
          <CustomersTab
            customers={customers}
            customersPagination={customersPagination}
            customersLoading={customersLoading}
            customersPage={customersPage}
            customersLimit={customersLimit}
            onRefreshCustomers={fetchCustomers}
            onSetCustomersPage={setCustomersPage}
            onSetCustomersPageSize={handleCustomersPageSizeChange}
          />
        )}
        {/* Settings Tab */}
        {activeTab === "settings" && <SettingsTab />}
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
