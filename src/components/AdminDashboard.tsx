
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoticeManager } from '@/components/admin/NoticeManager';
import { SliderManager } from '@/components/admin/SliderManager';
import { ProductManager } from '@/components/admin/ProductManager';
import { OrderManager } from '@/components/admin/OrderManager';
import { EmailManager } from '@/components/admin/EmailManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="slider">Slider</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notices">
          <NoticeManager />
        </TabsContent>
        
        <TabsContent value="slider">
          <SliderManager />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrderManager />
        </TabsContent>
        
        <TabsContent value="emails">
          <EmailManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
