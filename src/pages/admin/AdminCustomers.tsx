import { CustomersTab } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminCustomers = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [customersPagination, setCustomersPagination] = useState(null);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersPage, setCustomersPage] = useState(1);
  const [customersLimit, setCustomersLimit] = useState(20);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      fetchCustomers();
    }
  }, [user, isAdmin, isLoading, navigate, customersPage, customersLimit]);
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const { data, error } = await adminService.getAllUsers(
        customersPage,
        customersLimit
      );

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setCustomers(data.data);
        setCustomersPagination(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCustomersPageSizeChange = (newSize: number) => {
    setCustomersLimit(newSize);
    setCustomersPage(1); // Reset to first page when changing page size
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
  );
};

export default AdminCustomers;
