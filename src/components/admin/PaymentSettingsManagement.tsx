import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { settingsService } from "@/services";
import { Settings, Truck } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentMethodSettings {
  name: string;
  is_enabled: boolean;
  display_name: string;
  description?: string;
  icon?: string;
}

interface PaymentSettings {
  id: string;
  aamarpay: PaymentMethodSettings;
  cash_on_delivery: PaymentMethodSettings;
  delivery_charges: {
    inside_dhaka: number;
    outside_dhaka: number;
  };
  created_at: string;
  updated_at?: string;
}

const PaymentSettingsManagement = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState({
    inside_dhaka: 60,
    outside_dhaka: 120,
  });
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await settingsService.getPaymentSettings();

      if (error) {
        throw new Error(error);
      }

      setSettings(data || null);

      // Set delivery charges from settings
      if (data?.delivery_charges) {
        setDeliveryCharges(data.delivery_charges);
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = async (methodName: string, enabled: boolean) => {
    try {
      setUpdating(true);

      const { data, error } = await settingsService.togglePaymentMethod(
        methodName,
        enabled
      );

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: `Payment method ${
          enabled ? "enabled" : "disabled"
        } successfully`,
      });

      // Refresh settings
      await fetchSettings();
    } catch (error: any) {
      console.error("Error toggling payment method:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment method",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateDeliveryCharges = async () => {
    try {
      setUpdating(true);

      const { data, error } = await settingsService.updateDeliveryCharges(
        deliveryCharges.inside_dhaka,
        deliveryCharges.outside_dhaka
      );

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Delivery charges updated successfully",
      });

      // Refresh settings
      await fetchSettings();
    } catch (error: any) {
      console.error("Error updating delivery charges:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery charges",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-white">Loading payment settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-white mb-4">Failed to load payment settings</p>
            <Button
              onClick={fetchSettings}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const paymentMethods = [
    {
      key: "aamarpay",
      settings: settings.aamarpay,
    },
    {
      key: "cash_on_delivery",
      settings: settings.cash_on_delivery,
    },
  ];

  return (
    <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Payment Methods Management
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enable or disable payment methods for customers. At least one method
          must remain enabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map(({ key, settings: methodSettings }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg border border-teal-500/30"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-white font-semibold">
                    {methodSettings.display_name}
                  </h3>
                  <Badge
                    className={
                      methodSettings.is_enabled
                        ? "bg-emerald-600"
                        : "bg-gray-600"
                    }
                  >
                    {methodSettings.is_enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {methodSettings.description && (
                  <p className="text-gray-300 text-sm mt-1">
                    {methodSettings.description}
                  </p>
                )}
              </div>
              <Switch
                checked={methodSettings.is_enabled}
                onCheckedChange={(enabled) => togglePaymentMethod(key, enabled)}
                disabled={updating}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          ))}{" "}
        </div>

        {/* Delivery Charges Section */}
        <div className="mt-8">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Delivery Charges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inside_dhaka" className="text-white">
                Inside Dhaka (৳)
              </Label>
              <Input
                id="inside_dhaka"
                type="number"
                min="0"
                step="0.01"
                value={deliveryCharges.inside_dhaka}
                onChange={(e) =>
                  setDeliveryCharges((prev) => ({
                    ...prev,
                    inside_dhaka: parseFloat(e.target.value) || 0,
                  }))
                }
                className="bg-white/10 border-teal-500/30 text-white"
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outside_dhaka" className="text-white">
                Outside Dhaka (৳)
              </Label>
              <Input
                id="outside_dhaka"
                type="number"
                min="0"
                step="0.01"
                value={deliveryCharges.outside_dhaka}
                onChange={(e) =>
                  setDeliveryCharges((prev) => ({
                    ...prev,
                    outside_dhaka: parseFloat(e.target.value) || 0,
                  }))
                }
                className="bg-white/10 border-teal-500/30 text-white"
                placeholder="120"
              />
            </div>
          </div>
          <Button
            onClick={updateDeliveryCharges}
            disabled={updating}
            className="mt-4 bg-teal-600 hover:bg-teal-700"
          >
            {updating ? "Updating..." : "Update Delivery Charges"}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
          <p className="text-amber-300 text-sm">
            <strong>Note:</strong> At least one payment method must remain
            enabled to allow customers to place orders. The system will prevent
            you from disabling all payment methods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSettingsManagement;
