import { Badge } from "@/components/ui/badge";
import { Order } from "@/services/types";
import { Edit, Package, ShoppingCart } from "lucide-react";
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
}: OrdersTabProps) => {
  const getStatusBadge = (
    status: string,
    type: "status" | "payment" | "delivery"
  ) => {
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
    } else if (type === "delivery") {
      switch (status) {
        case "pending":
          bgColor = "bg-yellow-500";
          break;
        case "preparing":
          bgColor = "bg-blue-500";
          break;
        case "shipped":
          bgColor = "bg-purple-500";
          break;
        case "delivered":
          bgColor = "bg-green-500";
          break;
      }
    }

    const prefix =
      type === "payment" ? "Pay: " : type === "delivery" ? "Del: " : "";
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
          <ShoppingCart className="w-5 h-5 text-teal-400" />
          <div>
            <p className="text-white font-semibold">
              #{order.id.substring(0, 8)}
            </p>
            <p className="text-gray-400 text-sm">
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
          <p className="text-white font-medium">
            {order.shipping_address?.firstName}{" "}
            {order.shipping_address?.lastName}
          </p>
          <p className="text-gray-400 text-sm">
            {order.shipping_address?.phone}
          </p>
          <p className="text-gray-400 text-sm">{order.payment_method}</p>
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (order) => (
        <p className="text-white font-semibold text-lg">
          ৳{order.total_amount}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <div className="flex flex-col space-y-1">
          {getStatusBadge(order.status, "status")}
          {getStatusBadge(order.payment_status, "payment")}
          {getStatusBadge(order.delivery_status, "delivery")}
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
    pageSize: ordersPagination?.page_size || ordersLimit,
    hasNextPage: ordersPagination?.has_next || false,
    hasPreviousPage: ordersPagination?.has_previous || false,
  };

  const renderCustomRow = (order: any, index: number) => (
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
              {new Date(order.created_at).toLocaleDateString()} •{" "}
              {order.payment_method}
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
              {getStatusBadge(order.status, "status")}
              {getStatusBadge(order.payment_status, "payment")}
              {getStatusBadge(order.delivery_status, "delivery")}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={() => action.onClick(order)}
                className="px-3 py-1.5 text-sm border border-teal-400 text-teal-400 rounded hover:bg-teal-900/50 transition-colors flex items-center space-x-1"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {order.shipping_address && (
        <div className="mt-3 pt-3 border-t border-teal-500/30">
          <p className="text-gray-300 text-sm">
            <strong>Address:</strong> {order.shipping_address.address},{" "}
            {order.shipping_address.area}, {order.shipping_address.city}
            {order.shipping_address.zipCode &&
              ` - ${order.shipping_address.zipCode}`}
          </p>
        </div>
      )}
    </div>
  );
  return (
    <AdminTable
      title="Order Management"
      description="Manage all customer orders and delivery status"
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
    />
  );
};

export default OrdersTab;
