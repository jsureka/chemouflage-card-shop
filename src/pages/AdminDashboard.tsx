
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from Supabase
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Total Orders",
      value: "245",
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Active Customers",
      value: "1,234",
      change: "+4.1%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.5%",
      icon: BarChart3,
      trend: "down"
    }
  ];

  const customers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "customer", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "customer", status: "active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "customer", status: "inactive" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", role: "admin", status: "active" },
  ];

  const orders = [
    { id: "ORD-001", customer: "John Doe", amount: "$99.99", status: "completed", date: "2024-01-15" },
    { id: "ORD-002", customer: "Jane Smith", amount: "$99.99", status: "processing", date: "2024-01-14" },
    { id: "ORD-003", customer: "Bob Johnson", amount: "$99.99", status: "pending", date: "2024-01-13" },
    { id: "ORD-004", customer: "Alice Brown", amount: "$99.99", status: "completed", date: "2024-01-12" },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-300">
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'processing': return 'bg-yellow-600';
      case 'pending': return 'bg-orange-600';
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="text-white">
            Welcome back, {user?.name}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'customers', 'orders'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "text-white hover:bg-white/10"
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <stat.icon className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <BarChart3 className="h-16 w-16" />
                    <span className="ml-4">Chart will be implemented with real data</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <BarChart3 className="h-16 w-16" />
                    <span className="ml-4">Chart will be implemented with real data</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Customer Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage customer accounts and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{customer.name}</p>
                        <p className="text-gray-400 text-sm">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(customer.status)} text-white`}>
                        {customer.status}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-400">
                        {customer.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
              <CardDescription className="text-gray-300">
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-white font-semibold">{order.id}</p>
                        <p className="text-gray-400 text-sm">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-semibold">{order.amount}</span>
                      <span className="text-gray-400 text-sm">{order.date}</span>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
