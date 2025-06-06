import React, { useEffect, useState } from "react";
import { useToast } from "../hooks/use-toast";
import { adminService } from "../services/admin";
import { Order } from "../services/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface OrderEditModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    status: "",
    payment_status: "",
    delivery_status: "",
    payment_method: "",
    total_amount: 0,
  });

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "processing", label: "Processing", color: "bg-blue-500" },
    { value: "shipped", label: "Shipped", color: "bg-purple-500" },
    { value: "delivered", label: "Delivered", color: "bg-green-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "paid", label: "Paid", color: "bg-green-500" },
    { value: "failed", label: "Failed", color: "bg-red-500" },
    { value: "refunded", label: "Refunded", color: "bg-gray-500" },
  ];

  const deliveryStatusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "preparing", label: "Preparing", color: "bg-blue-500" },
    { value: "shipped", label: "Shipped", color: "bg-purple-500" },
    { value: "delivered", label: "Delivered", color: "bg-green-500" },
  ];

  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        status: order.status,
        payment_status: order.payment_status,
        delivery_status: order.delivery_status,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
      });

      // Fetch detailed order information
      fetchOrderDetails();
    }
  }, [order, isOpen]);

  const fetchOrderDetails = async () => {
    if (!order) return;

    try {
      const response = await adminService.getOrderDetails(order.id);
      if (response.data) {
        setOrderDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const updates: any = {};

      // Only include changed fields
      if (formData.status !== order.status) updates.status = formData.status;
      if (formData.payment_status !== order.payment_status)
        updates.payment_status = formData.payment_status;
      if (formData.delivery_status !== order.delivery_status)
        updates.delivery_status = formData.delivery_status;
      if (formData.payment_method !== order.payment_method)
        updates.payment_method = formData.payment_method;
      if (formData.total_amount !== order.total_amount)
        updates.total_amount = formData.total_amount;

      const response = await adminService.updateOrderStatus(order.id, updates);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Order updated successfully",
        });
        onOrderUpdated();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (
    status: string,
    type: "status" | "payment" | "delivery"
  ) => {
    const options =
      type === "status"
        ? statusOptions
        : type === "payment"
        ? paymentStatusOptions
        : deliveryStatusOptions;

    const option = options.find((opt) => opt.value === status);
    return (
      <Badge className={`${option?.color || "bg-gray-500"} text-white`}>
        {option?.label || status}
      </Badge>
    );
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id.slice(-6)}</DialogTitle>
          <DialogDescription>
            Update order status, payment details, and delivery information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Current Status</Label>
              <div className="mt-1">
                {getStatusBadge(order.status, "status")}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Payment Status</Label>
              <div className="mt-1">
                {getStatusBadge(order.payment_status, "payment")}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Delivery Status</Label>
              <div className="mt-1">
                {getStatusBadge(order.delivery_status, "delivery")}
              </div>
            </div>
          </div>

          {/* Premium Code Information */}
          {orderDetails?.premium_code && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Premium Code Assigned
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-green-600">Code:</span>
                  <span className="font-mono ml-2">
                    {orderDetails.premium_code.code}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Status:</span>
                  <span className="ml-2">
                    {orderDetails.premium_code.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
              {orderDetails.premium_code.description && (
                <p className="text-sm text-green-700 mt-2">
                  {orderDetails.premium_code.description}
                </p>
              )}
            </div>
          )}

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="delivery_status">Delivery Status</Label>
                <Select
                  value={formData.delivery_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, delivery_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  placeholder="e.g., Credit Card, PayPal"
                />
              </div>

              <div>
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      total_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Auto-binding note */}
          {formData.payment_status === "paid" &&
            order.payment_status !== "paid" &&
            !orderDetails?.premium_code && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Setting payment status to "Paid" will
                  automatically bind an available premium code to this order.
                </p>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
