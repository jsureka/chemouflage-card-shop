import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import AdminTable, { PaginationInfo, TableColumn } from "./AdminTable";

interface CustomersTabProps {
  customers: any[];
  customersLoading: boolean;
  customersPage: number;
  customersLimit: number;
  onRefreshCustomers: () => void;
  onSetCustomersPage: (page: number) => void;
}

const CustomersTab = ({
  customers,
  customersLoading,
  customersPage,
  customersLimit,
  onRefreshCustomers,
  onSetCustomersPage,
}: CustomersTabProps) => {
  const columns: TableColumn[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: "w-16",
      render: (customer) => (
        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
          {customer.full_name?.charAt(0) ||
            customer.email?.charAt(0).toUpperCase() ||
            customer.id.charAt(0).toUpperCase()}
        </div>
      ),
    },
    {
      key: "full_name",
      label: "Name",
      render: (customer) => (
        <div>
          <p className="text-white font-semibold">
            {customer.full_name || customer.email}
          </p>
          <p className="text-gray-400 text-sm">{customer.email}</p>
          <p className="text-gray-400 text-sm">
            {customer.phone || "No phone"}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (customer) => (
        <Badge className="bg-emerald-600 text-white">
          {customer.role || "customer"}
        </Badge>
      ),
    },
  ];

  const pagination: PaginationInfo = {
    currentPage: customersPage,
    pageSize: customersLimit,
    hasNextPage: customers.length >= customersLimit,
    hasPreviousPage: customersPage > 0,
  };

  return (
    <AdminTable
      title="Customer Management"
      description="Manage customer accounts and information"
      icon={<Users className="w-5 h-5" />}
      data={customers}
      columns={columns}
      loading={customersLoading}
      loadingText="Loading customers..."
      emptyText="No customers found"
      emptyIcon={<Users className="w-12 h-12 text-gray-400" />}
      onRefresh={onRefreshCustomers}
      pagination={pagination}
      onPageChange={onSetCustomersPage}
      keyField="id"
    />
  );
};

export default CustomersTab;
