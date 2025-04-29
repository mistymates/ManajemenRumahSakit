
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { users } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to login.",
        variant: "destructive"
      });
      return;
    }

    const success = login(selectedUserId);
    
    if (success) {
      // Set authentication status in sessionStorage
      sessionStorage.setItem('authenticated', 'true');
      
      toast({
        title: "Login Successful",
        description: "Welcome to Hospital Equipment Management System",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid user selection.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Hospital Equipment Management System</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="user" className="text-sm font-medium text-gray-700">
              Select User
            </label>
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role.replace('_', ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
