import { OrderEditModal } from "@/components/OrderEditModal";
import { OrdersTab } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services";
import { Order } from "@/services/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Orders management state
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersPagination, setOrdersPagination] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(20);
  const [orderFilters, setOrderFilters] = useState({
    status: "",
    payment_status: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  // Order editing modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderEditModalOpen, setIsOrderEditModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      fetchAllOrders();
    }
  }, [
    user,
    isAdmin,
    isLoading,
    navigate,
    ordersPage,
    ordersLimit,
    orderFilters,
  ]);

  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await adminService.getAllOrders(
        ordersPage,
        ordersLimit,
        orderFilters
      );

      if (error) {
        throw new Error(error);
      }
      if (data) {
        setAllOrders(data.data);
        setOrdersPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
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

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderEditModalOpen(false);
  };

  const handleOrderUpdated = () => {
    fetchAllOrders();
    handleCloseOrderModal();
  };

  const handleOrdersPageSizeChange = (newSize: number) => {
    setOrdersLimit(newSize);
    setOrdersPage(1); // Reset to first page when changing page size
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
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
        filters={orderFilters}
        onFilterChange={setOrderFilters}
      />

      {/* Order Edit Modal */}
      <OrderEditModal
        order={selectedOrder}
        isOpen={isOrderEditModalOpen}
        onClose={handleCloseOrderModal}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
};

export default AdminOrders;
