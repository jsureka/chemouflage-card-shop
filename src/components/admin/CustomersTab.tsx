import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import AdminTable, { PaginationInfo, TableColumn } from "./AdminTable";

interface CustomersTabProps {
  customers: any[];
  customersPagination: any;
  customersLoading: boolean;
  customersPage: number;
  customersLimit: number;
  onRefreshCustomers: () => void;
  onSetCustomersPage: (page: number) => void;
  onSetCustomersPageSize?: (pageSize: number) => void;
}

const CustomersTab = ({
  customers,
  customersPagination,
  customersLoading,
  customersPage,
  customersLimit,
  onRefreshCustomers,
  onSetCustomersPage,
  onSetCustomersPageSize,
}: CustomersTabProps) => {
  const columns: TableColumn[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: "w-16",
      render: (customer) => (
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
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
          <p className="text-foreground font-semibold">
            {customer.full_name || customer.email}
          </p>
          <p className="text-muted-foreground text-sm">{customer.email}</p>
          <p className="text-muted-foreground text-sm">
            {customer.phone || "No phone"}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (customer) => (
        <Badge className="bg-primary hover:bg-primary/90">
          {customer.role || "customer"}
        </Badge>
      ),
    },
  ];
  const pagination: PaginationInfo = {
    currentPage: customersPagination?.current_page || 1,
    totalPages: customersPagination?.total_pages || 1,
    pageSize: customersPagination?.page_size || customersLimit,
    totalItems: customersPagination?.total_items || 0,
    hasNextPage: customersPagination?.has_next || false,
    hasPreviousPage: customersPagination?.has_previous || false,
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
      onPageSizeChange={onSetCustomersPageSize}
      keyField="id"
    />
  );
};

export default CustomersTab;
