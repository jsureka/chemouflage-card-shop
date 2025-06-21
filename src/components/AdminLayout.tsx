import CloudinaryImage from "@/components/CloudinaryImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const tabs = [
    { path: "/admin", label: "Overview", exact: true },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/customers", label: "Customers" },
    { path: "/admin/premium-codes", label: "Premium Codes" },
    { path: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>{" "}
            <div className="flex items-center space-x-4">
              <CloudinaryImage
                fileName="logoRound_1_yn0smh.png"
                alt="Chemouflage Logo"
                className="w-8 h-8 object-contain"
                width={32}
                height={32}
              />
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-foreground">Welcome back, {user?.email}</div>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Content Area */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
