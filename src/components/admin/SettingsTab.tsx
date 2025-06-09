import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";
import PaymentSettingsManagement from "./PaymentSettingsManagement";

const SettingsTab = () => {
  return (
    <div className="space-y-6">
      {/* Payment Methods Management */}
      <PaymentSettingsManagement />

      {/* System Information */}
      <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Information
          </CardTitle>
          <CardDescription className="text-gray-300">
            System configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
              <h3 className="text-white font-semibold mb-2">Authentication</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Google OAuth</span>
                  <span className="text-emerald-400 text-sm">Configured</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">JWT Authentication</span>
                  <span className="text-emerald-400 text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30">
              <h3 className="text-white font-semibold mb-2">Database</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MongoDB Connection</span>
                  <span className="text-emerald-400 text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Data Backup</span>
                  <span className="text-amber-400 text-sm">Manual</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
