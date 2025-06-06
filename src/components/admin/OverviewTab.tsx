import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

interface OverviewTabProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
  };
  orders: any[];
}

const OverviewTab = ({ stats, orders }: OverviewTabProps) => {
  const dashboardStats = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      change: "+12.5%",
      icon: Package,
      trend: "up",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      change: "+15.3%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: "+4.1%",
      icon: Users,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-emerald-400">
                    {stat.change} from last month
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-teal-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <ShoppingCart className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-white font-semibold">
                      Order #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-gray-400 text-sm">Customer Order</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-white font-semibold">
                    ৳{order.total_amount}
                  </span>
                  <Badge className="bg-teal-600 text-white">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
