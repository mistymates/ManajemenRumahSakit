
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">404</h1>
        <h2 className="text-2xl font-medium mb-6 text-gray-700">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
