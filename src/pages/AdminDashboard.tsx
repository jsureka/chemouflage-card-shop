
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard as AdminDashboardComponent } from '@/components/AdminDashboard';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboardComponent />;
};

export default AdminDashboard;
