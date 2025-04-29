
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipment } from '@/contexts/EquipmentContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const { equipment, damageReports, equipmentRequests } = useEquipment();
  const navigate = useNavigate();
  const [chartFilter, setChartFilter] = useState<'category' | 'status' | 'location'>('category');

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate equipment statistics
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const inUseEquipment = equipment.filter(e => e.status === 'in-use').length;
  const damagedEquipment = equipment.filter(e => e.status === 'damaged').length;
  
  const pendingRequests = equipmentRequests.filter(req => req.status === 'pending').length;
  const activeReports = damageReports.filter(rep => rep.status !== 'resolved').length;

  // Prepare chart data based on filter
  const getChartData = () => {
    if (chartFilter === 'category') {
      const categoryCount: Record<string, number> = {};
      equipment.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      return Object.keys(categoryCount).map(category => ({
        name: category,
        count: categoryCount[category]
      }));
    } 
    else if (chartFilter === 'status') {
      return [
        { name: 'Available', count: availableEquipment, color: '#4ade80' },
        { name: 'In Use', count: inUseEquipment, color: '#60a5fa' },
        { name: 'Damaged', count: damagedEquipment, color: '#f87171' }
      ];
    } 
    else if (chartFilter === 'location') {
      const locationCount: Record<string, number> = {};
      equipment.forEach(item => {
        locationCount[item.location] = (locationCount[item.location] || 0) + 1;
      });
      return Object.keys(locationCount).map(location => ({
        name: location,
        count: locationCount[location]
      }));
    }
    
    return [];
  };
  
  const chartData = getChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEquipment}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableEquipment}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inUseEquipment}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Damaged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{damagedEquipment}</div>
            </CardContent>
          </Card>
        </div>

        {hasRole('manager') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Equipment Distribution</CardTitle>
                  <Select
                    value={chartFilter}
                    onValueChange={(value) => setChartFilter(value as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">By Category</SelectItem>
                      <SelectItem value="status">By Status</SelectItem>
                      <SelectItem value="location">By Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartFilter === 'status' ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="font-medium">Pending Requests</div>
                    <div className="text-2xl font-bold">{pendingRequests}</div>
                    <Button 
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => navigate('/requests')}
                    >
                      View Requests
                    </Button>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="font-medium">Active Damage Reports</div>
                    <div className="text-2xl font-bold">{activeReports}</div>
                    <Button 
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => navigate('/reports')}
                    >
                      View Reports
                    </Button>
                  </div>
                  
                  {hasRole('logistics_staff') && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium">Add New Equipment</div>
                      <Button
                        className="mt-2 w-full"
                        onClick={() => navigate('/equipment/add')}
                      >
                        Add Equipment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Quick Access Card for all users */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center"
                onClick={() => navigate('/equipment')}
              >
                <span className="text-lg mb-1">View Equipment</span>
                <span className="text-sm text-gray-500">Browse all equipment</span>
              </Button>
              
              {hasRole('nurse') && (
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => navigate('/requests/new')}
                >
                  <span className="text-lg mb-1">Request Equipment</span>
                  <span className="text-sm text-gray-500">Submit new requests</span>
                </Button>
              )}
              
              {hasRole('nurse') && (
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => navigate('/reports/new')}
                >
                  <span className="text-lg mb-1">Report Damage</span>
                  <span className="text-sm text-gray-500">Report equipment issues</span>
                </Button>
              )}
              
              {hasRole(['logistics_staff', 'manager']) && (
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => navigate('/reports')}
                >
                  <span className="text-lg mb-1">View Reports</span>
                  <span className="text-sm text-gray-500">Manage damage reports</span>
                </Button>
              )}
              
              {hasRole('manager') && (
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => navigate('/categories')}
                >
                  <span className="text-lg mb-1">Manage Categories</span>
                  <span className="text-sm text-gray-500">Edit equipment categories</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
