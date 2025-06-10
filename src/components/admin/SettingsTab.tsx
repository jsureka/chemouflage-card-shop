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
      <Card className="bg-background/80 backdrop-blur-lg border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            System configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-background/80 rounded-lg border border-border">
              <h3 className="text-foreground font-semibold mb-2">
                Authentication
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Google OAuth</span>
                  <span className="text-primary text-sm">Configured</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    JWT Authentication
                  </span>
                  <span className="text-primary text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background/80 rounded-lg border border-border">
              <h3 className="text-foreground font-semibold mb-2">Database</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    MongoDB Connection
                  </span>
                  <span className="text-primary text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Backup</span>
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
