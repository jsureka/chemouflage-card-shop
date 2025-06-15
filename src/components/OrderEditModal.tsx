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
    payment_method: "",
    total_amount: 0,
    delivery_charge: 0,
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
  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
        delivery_charge: order.delivery_charge || 0,
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
      const updates: any = {}; // Only include changed fields
      if (formData.status !== order.status) updates.status = formData.status;
      if (formData.payment_status !== order.payment_status)
        updates.payment_status = formData.payment_status;
      if (formData.payment_method !== order.payment_method)
        updates.payment_method = formData.payment_method;
      if (formData.total_amount !== order.total_amount)
        updates.total_amount = formData.total_amount;
      if (formData.delivery_charge !== (order.delivery_charge || 0))
        updates.delivery_charge = formData.delivery_charge;

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
  const getStatusBadge = (status: string, type: "status" | "payment") => {
    const options = type === "status" ? statusOptions : paymentStatusOptions;

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
      <DialogContent className="max-w-2xl dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Edit Order #{order.id.slice(-6)}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Update order status, payment details, and delivery information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {" "}
          {/* Order Summary */}{" "}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Amount
              </p>
              <p className="font-semibold text-black dark:text-white">
                ৳{order.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Delivery Charge
              </p>
              <p className="font-semibold text-black dark:text-white">
                ৳{(order.delivery_charge || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created
              </p>
              <p className="font-semibold text-black dark:text-white">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>{" "}
          {/* Current Status Display */}{" "}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Current Status
              </Label>
              <div className="mt-1">
                {getStatusBadge(order.status, "status")}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Payment Status
              </Label>
              <div className="mt-1">
                {getStatusBadge(order.payment_status, "payment")}
              </div>
            </div>
          </div>{" "}
          {/* Premium Code Information */}
          {orderDetails?.premium_code && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                Premium Code Assigned
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-green-600 dark:text-green-400">
                    Code:
                  </span>
                  <span className="font-mono ml-2 dark:text-gray-200">
                    {orderDetails.premium_code.code}
                  </span>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400">
                    Status:
                  </span>
                  <span className="ml-2 dark:text-gray-200">
                    {orderDetails.premium_code.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
              {orderDetails.premium_code.description && (
                <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                  {orderDetails.premium_code.description}
                </p>
              )}
            </div>
          )}
          {/* Edit Form */}{" "}
          <div className="space-y-4">
            {" "}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="dark:text-gray-300">
                  Order Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_status" className="dark:text-gray-300">
                  Payment Status
                </Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_status: value }))
                  }
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>{" "}
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="delivery_charge">Delivery Charge (৳)</Label>
                <Input
                  id="delivery_charge"
                  type="number"
                  step="0.01"
                  value={formData.delivery_charge}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      delivery_charge: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="total_amount">Total Amount (৳)</Label>
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
          </div>{" "}
          {/* Auto-binding note */}
          {formData.payment_status === "paid" &&
            order.payment_status !== "paid" &&
            !orderDetails?.premium_code && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Setting payment status to "Paid" will
                  automatically bind an available premium code to this order.
                </p>
              </div>
            )}
        </div>{" "}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
