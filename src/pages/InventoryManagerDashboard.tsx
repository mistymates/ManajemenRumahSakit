import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipment } from '@/contexts/EquipmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { EquipmentHistory } from '@/types';
import { format, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = {
  'available': '#00C49F',
  'in-use': '#0088FE',
  'damaged': '#FF8042'
};

const InventoryManagerDashboard = () => {
  const { user } = useAuth();
  const { equipment, history, categories, damageReports, equipmentRequests } = useEquipment();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7days'); // '7days', '30days', '90days'

  if (!user) {
    return null;
  }

  // Calculate statistics for overview
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const inUseEquipment = equipment.filter(e => e.status === 'in-use').length;
  const damagedEquipment = equipment.filter(e => e.status === 'damaged').length;
  
  // Calculate percentages
  const availablePercentage = totalEquipment ? Math.round((availableEquipment / totalEquipment) * 100) : 0;
  const inUsePercentage = totalEquipment ? Math.round((inUseEquipment / totalEquipment) * 100) : 0;
  const damagedPercentage = totalEquipment ? Math.round((damagedEquipment / totalEquipment) * 100) : 0;
  
  // Calculate maintenance statistics
  const today = new Date();
  const needMaintenanceCount = equipment.filter(e => {
    if (!e.nextMaintenanceDate) return false;
    const maintenanceDate = new Date(e.nextMaintenanceDate);
    return maintenanceDate <= today;
  }).length;
  
  const maintenanceSoonCount = equipment.filter(e => {
    if (!e.nextMaintenanceDate) return false;
    const maintenanceDate = new Date(e.nextMaintenanceDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return maintenanceDate > today && maintenanceDate <= thirtyDaysFromNow;
  }).length;
  
  // Calculate request statistics
  const pendingRequestsCount = equipmentRequests.filter(r => r.status === 'pending').length;
  const approvedRequestsCount = equipmentRequests.filter(r => r.status === 'approved').length;
  const completedRequestsCount = equipmentRequests.filter(r => r.status === 'completed').length;
  
  // Calculate damage report statistics
  const reportedDamageCount = damageReports.filter(r => r.status === 'reported').length;
  const inRepairCount = damageReports.filter(r => r.status === 'in-repair').length;
  const resolvedDamageCount = damageReports.filter(r => r.status === 'resolved').length;

  const statusData = [
    { name: 'Available', value: availableEquipment },
    { name: 'In Use', value: inUseEquipment },
    { name: 'Damaged', value: damagedEquipment },
  ];

  // Calculate category distribution
  const categoryDistribution = categories.map(category => {
    const count = equipment.filter(e => e.category === category.name).length;
    return {
      name: category.name,
      count
    };
  }).sort((a, b) => b.count - a.count);

  // Calculate recent activity
  const recentHistory = [...history]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Calculate equipment usage over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const usageOverTime = last7Days.map(date => {
    const dayHistory = history.filter(h => h.timestamp.startsWith(date));
    const assigned = dayHistory.filter(h => h.action === 'assigned').length;
    const returned = dayHistory.filter(h => h.action === 'returned').length;
    const moved = dayHistory.filter(h => h.action === 'moved').length;
    
    return {
      date: format(new Date(date), 'MMM dd'),
      assigned,
      returned,
      moved
    };
  });

  // Group equipment history by equipment
  const equipmentHistoryMap = new Map<string, EquipmentHistory[]>();
  
  history.forEach(item => {
    if (!equipmentHistoryMap.has(item.equipmentId)) {
      equipmentHistoryMap.set(item.equipmentId, []);
    }
    equipmentHistoryMap.get(item.equipmentId)?.push(item);
  });

  // Sort equipment by most activity
  const equipmentWithMostActivity = Array.from(equipmentHistoryMap.entries())
    .map(([equipmentId, historyItems]) => {
      const equipmentItem = equipment.find(e => e.id === equipmentId);
      return {
        id: equipmentId,
        name: equipmentItem?.name || 'Unknown',
        activityCount: historyItems.length
      };
    })
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 5);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Manager Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Here's your equipment inventory overview.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/categories')}>Manage Categories</Button>
          <Button variant="outline" onClick={() => navigate('/equipment')}>View All Equipment</Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Equipment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="reports">Reports & Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEquipment}</div>
                <p className="text-xs text-muted-foreground mt-1">Total inventory items</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{availableEquipment}</div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${availablePercentage}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{availablePercentage}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{inUseEquipment}</div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${inUsePercentage}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{inUsePercentage}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Damaged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{damagedEquipment}</div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${damagedPercentage}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{damagedPercentage}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-red-500">{needMaintenanceCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">items need immediate attention</div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="text-lg font-medium text-yellow-500">{maintenanceSoonCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">items due for maintenance in 30 days</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Equipment Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-blue-500">{pendingRequestsCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">pending requests</div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="text-lg font-medium text-green-500">{approvedRequestsCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">approved, awaiting completion</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Damage Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-red-500">{reportedDamageCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">new reports</div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="text-lg font-medium text-yellow-500">{inRepairCount}</div>
                  <div className="text-sm ml-2 text-muted-foreground">items currently in repair</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>Current distribution of equipment by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Equipment distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest equipment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHistory.map(item => {
                  const equipmentItem = equipment.find(e => e.id === item.equipmentId);
                  return (
                    <div key={item.id} className="flex items-start space-x-4 border-b pb-3">
                      <div className="flex-1">
                        <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.action === 'status_changed' && `Status changed from ${item.fromStatus} to ${item.toStatus}`}
                          {item.action === 'moved' && `Moved from ${item.fromLocation} to ${item.toLocation}`}
                          {item.action === 'assigned' && 'Assigned to staff'}
                          {item.action === 'returned' && 'Returned to inventory'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          By {item.userName} • {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment History</CardTitle>
              <CardDescription>Detailed history of all equipment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 30)
                  .map(item => {
                    const equipmentItem = equipment.find(e => e.id === item.equipmentId);
                    return (
                      <div key={item.id} className="flex items-start space-x-4 border-b pb-3">
                        <div className="flex-1">
                          <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.action === 'status_changed' && `Status changed from ${item.fromStatus} to ${item.toStatus}`}
                            {item.action === 'moved' && `Moved from ${item.fromLocation} to ${item.toLocation}`}
                            {item.action === 'assigned' && 'Assigned to staff'}
                            {item.action === 'returned' && 'Returned to inventory'}
                            {item.action === 'reported' && 'Reported as damaged'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            By {item.userName} • {new Date(item.timestamp).toLocaleString()}
                          </div>
                          {item.notes && (
                            <div className="text-sm mt-1 bg-muted p-2 rounded">
                              <span className="font-medium">Notes:</span> {item.notes}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                        >
                          View Equipment
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-md shadow-sm">
              <Button 
                variant={timeRange === '7days' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setTimeRange('7days')}
                className="rounded-l-md rounded-r-none"
              >
                7 Days
              </Button>
              <Button 
                variant={timeRange === '30days' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setTimeRange('30days')}
                className="rounded-none border-l-0 border-r-0"
              >
                30 Days
              </Button>
              <Button 
                variant={timeRange === '90days' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setTimeRange('90days')}
                className="rounded-r-md rounded-l-none"
              >
                90 Days
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Usage Over Time</CardTitle>
                <CardDescription>Activity trends over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={usageOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="assigned" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="returned" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="moved" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment with Most Activity</CardTitle>
                <CardDescription>Top 5 most active equipment items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={equipmentWithMostActivity}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activityCount" fill="#8884d8" name="Activity Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
                <CardDescription>Current distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Equipment Distribution</CardTitle>
                <CardDescription>Equipment allocation by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={equipment.reduce((acc, item) => {
                        const location = item.location;
                        const existingItem = acc.find(i => i.name === location);
                        if (existingItem) {
                          existingItem.count += 1;
                        } else {
                          acc.push({ name: location, count: 1 });
                        }
                        return acc;
                      }, [] as { name: string; count: number }[])}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" name="Equipment Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Needs Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{needMaintenanceCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Overdue for maintenance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{maintenanceSoonCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Due in the next 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Up to Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {totalEquipment - needMaintenanceCount - maintenanceSoonCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">No maintenance needed</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Equipment due for maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment
                  .filter(e => {
                    if (!e.nextMaintenanceDate) return false;
                    const maintenanceDate = new Date(e.nextMaintenanceDate);
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(today.getDate() + 30);
                    return maintenanceDate <= thirtyDaysFromNow;
                  })
                  .sort((a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
                  .slice(0, 10)
                  .map(item => {
                    const maintenanceDate = new Date(item.nextMaintenanceDate);
                    const isOverdue = maintenanceDate <= today;
                    return (
                      <div key={item.id} className="flex items-start space-x-4 border-b pb-3">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm">
                            <span 
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {isOverdue ? 'Overdue' : 'Due Soon'}
                            </span>
                            <span className="ml-2">Next maintenance: {new Date(item.nextMaintenanceDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last maintenance: {new Date(item.lastMaintenanceDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/equipment/${item.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Recent maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history
                  .filter(h => h.notes.toLowerCase().includes('maintenance') || h.notes.toLowerCase().includes('repair'))
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 5)
                  .map(item => {
                    const equipmentItem = equipment.find(e => e.id === item.equipmentId);
                    return (
                      <div key={item.id} className="flex items-start space-x-4 border-b pb-3">
                        <div className="flex-1">
                          <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                          <div className="text-sm">
                            {item.action === 'status_changed' && `Status changed from ${item.fromStatus} to ${item.toStatus}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            By {item.userName} • {new Date(item.timestamp).toLocaleString()}
                          </div>
                          {item.notes && (
                            <div className="text-sm mt-1 bg-muted p-2 rounded">
                              <span className="font-medium">Notes:</span> {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Damage Reports</CardTitle>
                <CardDescription>Current damage report status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {damageReports
                    .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
                    .slice(0, 5)
                    .map(report => {
                      const equipmentItem = equipment.find(e => e.id === report.equipmentId);
                      return (
                        <div key={report.id} className="flex items-start space-x-4 border-b pb-3">
                          <div className="flex-1">
                            <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                            <div className="text-sm">
                              <span 
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  report.status === 'reported' ? 'bg-yellow-100 text-yellow-800' : 
                                  report.status === 'in-repair' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {report.status}
                              </span>
                              <span className="ml-2">{report.description}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Reported by {report.reporterName} • {new Date(report.reportDate).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/reports')}
                          >
                            View Details
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate('/reports')} className="w-full">
                    View All Damage Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Equipment Requests</CardTitle>
                <CardDescription>Current equipment requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentRequests
                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                    .slice(0, 5)
                    .map(request => {
                      const equipmentItem = equipment.find(e => e.id === request.equipmentId);
                      return (
                        <div key={request.id} className="flex items-start space-x-4 border-b pb-3">
                          <div className="flex-1">
                            <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                            <div className="text-sm">
                              <span 
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  request.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                                  request.status === 'denied' ? 'bg-red-100 text-red-800' :
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {request.status}
                              </span>
                              <span className="ml-2">{request.reason}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Requested by {request.requesterName} • {new Date(request.requestDate).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/requests')}
                          >
                            View Details
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate('/requests')} className="w-full">
                    View All Equipment Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Request and Report Analytics</CardTitle>
              <CardDescription>Summary of requests and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Pending Requests', value: pendingRequestsCount },
                      { name: 'Approved Requests', value: approvedRequestsCount },
                      { name: 'Completed Requests', value: completedRequestsCount },
                      { name: 'Reported Damage', value: reportedDamageCount },
                      { name: 'In Repair', value: inRepairCount },
                      { name: 'Resolved Damage', value: resolvedDamageCount },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagerDashboard;
