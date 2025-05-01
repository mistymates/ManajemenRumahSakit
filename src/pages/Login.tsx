import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Mohon masukkan nama pengguna dan kata sandi.",
        variant: "destructive"
      });
      return;
    }

    const success = login(username, password);
    
    if (success) {
      // Set authentication status in sessionStorage
      sessionStorage.setItem('authenticated', 'true');
      
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di Sistem Manajemen Peralatan Rumah Sakit",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Gagal",
        description: "Nama pengguna atau kata sandi tidak valid.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistem Manajemen Peralatan Rumah Sakit</CardTitle>
          <CardDescription>Masuk untuk mengakses dashboard Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nama Pengguna</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Masukkan nama pengguna Anda" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Masukkan kata sandi Anda" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
