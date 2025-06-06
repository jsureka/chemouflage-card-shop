import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsTab = () => {
  return (
    <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          System Settings
        </CardTitle>
        <CardDescription className="text-gray-300">
          Configure system-wide settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
            <h3 className="text-white font-semibold mb-2">Payment Methods</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">bKash</span>
                <Badge className="bg-emerald-600">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Google Pay (OAuth)</span>
                <Badge className="bg-emerald-600">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Cash on Delivery</span>
                <Badge className="bg-emerald-600">Active</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
            <h3 className="text-white font-semibold mb-2">Social Login</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Google OAuth</span>
                <Badge className="bg-emerald-600">Configured</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
