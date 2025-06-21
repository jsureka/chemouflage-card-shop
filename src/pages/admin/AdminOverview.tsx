import { OverviewTab } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services";
import { Order } from "@/services/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminOverview = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isLoading, navigate]);

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
      }      if (ordersData) {
        setOrders(ordersData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <OverviewTab stats={stats} orders={orders} />;
};

export default AdminOverview;
