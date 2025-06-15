import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/services/types";
import { Edit, Filter, Package, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import AdminTable, {
  PaginationInfo,
  TableAction,
  TableColumn,
} from "./AdminTable";

interface OrdersTabProps {
  allOrders: any[];
  ordersPagination: any;
  ordersLoading: boolean;
  ordersPage: number;
  ordersLimit: number;
  onRefreshOrders: () => void;
  onEditOrder: (order: Order) => void;
  onSetOrdersPage: (page: number) => void;
  onSetOrdersPageSize?: (pageSize: number) => void;
  filters?: {
    status: string;
    payment_status: string;
    search: string;
    date_from: string;
    date_to: string;
  };
  onFilterChange?: (filters: {
    status: string;
    payment_status: string;
    search: string;
    date_from: string;
    date_to: string;
  }) => void;
}

const OrdersTab = ({
  allOrders,
  ordersPagination,
  ordersLoading,
  ordersPage,
  ordersLimit,
  onRefreshOrders,
  onEditOrder,
  onSetOrdersPage,
  onSetOrdersPageSize,
  filters,
  onFilterChange,
}: OrdersTabProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: filters?.status || "all",
    payment_status: filters?.payment_status || "all",
    search: filters?.search || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
  });
  // Apply filters when the filter button is clicked
  const applyFilters = () => {
    if (onFilterChange) {
      // Convert "all" values to empty strings for the backend API
      const apiFilters = {
        ...localFilters,
        status: localFilters.status === "all" ? "" : localFilters.status,
        payment_status:
          localFilters.payment_status === "all"
            ? ""
            : localFilters.payment_status,
      };
      onFilterChange(apiFilters);
    }
  };
  // Reset all filters
  const resetFilters = () => {
    const resetFilters = {
      status: "all",
      payment_status: "all",
      search: "",
      date_from: "",
      date_to: "",
    };
    setLocalFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange({
        status: "",
        payment_status: "",
        search: "",
        date_from: "",
        date_to: "",
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusBadge = (status: string, type: "status" | "payment") => {
    let bgColor = "bg-gray-600";

    if (type === "status") {
      switch (status) {
        case "pending":
          bgColor = "bg-yellow-600";
          break;
        case "processing":
          bgColor = "bg-blue-600";
          break;
        case "shipped":
          bgColor = "bg-purple-600";
          break;
        case "delivered":
          bgColor = "bg-green-600";
          break;
        case "cancelled":
          bgColor = "bg-red-600";
          break;
      }
    } else if (type === "payment") {
      switch (status) {
        case "pending":
          bgColor = "bg-yellow-500";
          break;
        case "paid":
          bgColor = "bg-green-500";
          break;
        case "failed":
          bgColor = "bg-red-500";
          break;
        case "refunded":
          bgColor = "bg-gray-500";
          break;
      }
    }
    const prefix = type === "payment" ? "Pay: " : "";
    const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);

    return (
      <Badge className={`${bgColor} text-white text-xs`}>
        {prefix}
        {displayStatus}
      </Badge>
    );
  };

  const columns: TableColumn<any>[] = [
    {
      key: "id",
      label: "Order",
      render: (order) => (
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <div>
            <p className="text-foreground font-semibold">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-muted-foreground text-sm">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => (
        <div>
          <p className="text-foreground font-medium">
            {order.shipping_address?.firstName}{" "}
            {order.shipping_address?.lastName}
          </p>
          <p className="text-muted-foreground text-sm">
            {order.shipping_address?.phone}
          </p>
          <p className="text-muted-foreground text-sm">
            {order.payment_method}
          </p>
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (order) => (
        <div>
          <p className="text-foreground font-semibold text-lg">
            ৳{order.total_amount}
          </p>
          <p className="text-muted-foreground text-sm">
            + ৳{order.delivery_charge || 0} delivery
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <div className="flex flex-col space-y-1">
          {getStatusBadge(order.status, "status")}
          {getStatusBadge(order.payment_status, "payment")}
        </div>
      ),
    },
  ];

  const actions: TableAction<any>[] = [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: onEditOrder,
      variant: "outline",
    },
  ];
  const pagination: PaginationInfo = {
    currentPage: ordersPagination?.current_page || 1,
    totalPages: ordersPagination?.total_pages || 1,
    pageSize: ordersPagination?.page_size || ordersLimit,
    totalItems: ordersPagination?.total_items || 0,
    hasNextPage: ordersPagination?.has_next || false,
    hasPreviousPage: ordersPagination?.has_previous || false,
  };

  const renderCustomRow = (order: any, index: number) => (
    <div
      key={order.id}
      className="p-4 bg-background/80 backdrop-blur-lg rounded-lg border border-border"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <div>
            <p className="text-foreground font-semibold">
              Order #{order.id.substring(0, 8)}
            </p>
            <p className="text-muted-foreground text-sm">
              Customer: {order.shipping_address?.firstName}{" "}
              {order.shipping_address?.lastName}
            </p>
            <p className="text-muted-foreground text-sm">
              {new Date(order.created_at).toLocaleDateString()} •{" "}
              {order.payment_method}
            </p>
            <p className="text-muted-foreground text-sm">
              Phone: {order.shipping_address?.phone}
            </p>
          </div>
        </div>
        <div className="text-right flex items-center space-x-4">
          <div>
            <p className="text-foreground font-semibold text-lg mb-2">
              ৳{order.total_amount}
            </p>{" "}
            <div className="flex flex-col space-y-1">
              {getStatusBadge(order.status, "status")}
              {getStatusBadge(order.payment_status, "payment")}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={() => action.onClick(order)}
                className="px-3 py-1.5 text-sm border border-primary/30 text-primary rounded hover:bg-primary/10 transition-colors flex items-center space-x-1"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {order.shipping_address && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-muted-foreground text-sm">
            <strong>Address:</strong> {order.shipping_address.address},{" "}
            {order.shipping_address.area}, {order.shipping_address.city}
            {order.shipping_address.zipCode &&
              ` - ${order.shipping_address.zipCode}`}
          </p>
        </div>
      )}
    </div>
  );
  // Create the custom toolbar directly rather than as a function
  const customToolbarContent = (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        {showFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 border rounded-lg bg-card/50">
          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter">Order Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {" "}
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <Label htmlFor="payment-status-filter">Payment Status</Label>
            <Select
              value={localFilters.payment_status}
              onValueChange={(value) =>
                handleFilterChange("payment_status", value)
              }
            >
              <SelectTrigger id="payment-status-filter">
                <SelectValue placeholder="All payment statuses" />
              </SelectTrigger>
              <SelectContent>
                {" "}
                <SelectItem value="all">All payment statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <div>
            <Label htmlFor="search-filter">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-filter"
                placeholder="Order ID, Customer name..."
                className="pl-8"
                value={localFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          {/* Date Range Filters */}
          <div>
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={localFilters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={localFilters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>

          {/* Apply Filters Button */}
          <div className="flex items-end">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <AdminTable
      title="Order Management"
      description="Manage all customer orders and their statuses"
      icon={<ShoppingCart className="w-5 h-5" />}
      data={allOrders}
      columns={columns}
      actions={actions}
      loading={ordersLoading}
      loadingText="Loading orders..."
      emptyIcon={<Package className="w-12 h-12 text-gray-400" />}
      emptyText="No orders found"
      pagination={pagination}
      onPageChange={onSetOrdersPage}
      onPageSizeChange={onSetOrdersPageSize}
      onRefresh={onRefreshOrders}
      renderRow={renderCustomRow}
      keyField="id"
      customToolbar={customToolbarContent}
    />
  );
};

export default OrdersTab;
