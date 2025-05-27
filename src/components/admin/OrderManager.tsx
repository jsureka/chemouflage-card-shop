
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  amount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_id: string;
  premium_code: string;
  created_at: string;
}

export const OrderManager = () => {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update order: ' + error.message);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">{order.order_number}</h3>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      <p className="text-sm mt-2">{order.delivery_address}</p>
                    </div>
                    
                    <div>
                      <div className="space-y-1">
                        <p className="text-sm">Amount: ৳{order.amount}</p>
                        <p className="text-sm">Delivery: ৳{order.delivery_charge}</p>
                        <p className="font-semibold">Total: ৳{order.total_amount}</p>
                        <p className="text-sm">Payment: {order.payment_method}</p>
                        <p className="text-sm">Date: {format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(order.order_status) as any}>
                          {order.order_status}
                        </Badge>
                      </div>
                      
                      <Select
                        value={order.order_status}
                        onValueChange={(status) => updateOrderMutation.mutate({ id: order.id, status })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {order.tracking_id && (
                        <p className="text-sm">Tracking: {order.tracking_id}</p>
                      )}
                      {order.premium_code && (
                        <p className="text-sm">Premium Code: {order.premium_code}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
