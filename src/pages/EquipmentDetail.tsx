
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEquipment } from '@/contexts/EquipmentContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { locations, users } from '@/data/mockData';
import { EquipmentStatus } from '@/types';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { 
    getEquipmentById, 
    getEquipmentHistoryById, 
    updateEquipmentStatus,
    updateEquipmentLocation,
    assignEquipment,
    requestEquipment,
    reportDamage
  } = useEquipment();

  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [isUpdateLocationDialogOpen, setIsUpdateLocationDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<EquipmentStatus>('available');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!id) {
    return <Layout>Equipment ID not provided.</Layout>;
  }

  const equipment = getEquipmentById(id);
  const history = getEquipmentHistoryById(id);

  if (!equipment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Equipment Not Found</h2>
          <p className="text-gray-600 mb-6">The equipment you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/equipment')}>Return to Equipment List</Button>
        </div>
      </Layout>
    );
  }

  const handleUpdateStatus = () => {
    if (!user) return;
    updateEquipmentStatus(id, selectedStatus, user.id, user.name, notes);
    setIsUpdateStatusDialogOpen(false);
    setNotes('');
  };

  const handleUpdateLocation = () => {
    if (!user || !selectedLocation) return;
    updateEquipmentLocation(id, selectedLocation, user.id, user.name, notes);
    setIsUpdateLocationDialogOpen(false);
    setNotes('');
  };

  const handleAssign = () => {
    if (!user) return;
    assignEquipment(id, selectedAssignee || null, user.id, user.name, notes);
    setIsAssignDialogOpen(false);
    setNotes('');
  };

  const handleRequest = () => {
    if (!user) return;
    requestEquipment({
      equipmentId: id,
      requesterId: user.id,
      requesterName: user.name,
      requestDate: new Date().toISOString(),
      reason: notes,
      notes: ''
    });
    setIsRequestDialogOpen(false);
    setNotes('');
  };

  const handleReportDamage = () => {
    if (!user) return;
    reportDamage({
      equipmentId: id,
      reporterId: user.id,
      reporterName: user.name,
      reportDate: new Date().toISOString(),
      description: notes,
      notes: ''
    });
    setIsReportDialogOpen(false);
    setNotes('');
  };

  const getStatusBadgeColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{equipment.name}</h1>
            <p className="text-gray-500">Serial Number: {equipment.serialNumber}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/equipment')}>
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Details Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Equipment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1">{equipment.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(equipment.status)}`}>
                    {equipment.status === 'available' ? 'Available' : 
                     equipment.status === 'in-use' ? 'In Use' : 'Damaged'}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Location</h3>
                <p className="mt-1">{equipment.location}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {equipment.status === 'in-use' ? 'Assigned To' : 'Last Used By'}
                </h3>
                <p className="mt-1">
                  {equipment.assignedTo 
                    ? users.find(u => u.id === equipment.assignedTo)?.name || 'Unknown User' 
                    : 'Not currently assigned'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Purchase Date</h3>
                <p className="mt-1">{equipment.purchaseDate}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Maintenance</h3>
                <p className="mt-1">{equipment.lastMaintenanceDate}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Next Maintenance Due</h3>
                <p className="mt-1">{equipment.nextMaintenanceDate}</p>
              </div>
            </div>
            
            {equipment.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-700">{equipment.notes}</p>
              </div>
            )}
          </div>

          {/* Actions Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              {hasRole(['logistics_staff', 'manager']) && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setIsUpdateStatusDialogOpen(true)}
                  >
                    Update Status
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedLocation(equipment.location);
                      setIsUpdateLocationDialogOpen(true);
                    }}
                  >
                    Update Location
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedAssignee(equipment.assignedTo || '');
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    {equipment.assignedTo ? 'Reassign Equipment' : 'Assign Equipment'}
                  </Button>
                </>
              )}

              {hasRole('nurse') && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setIsRequestDialogOpen(true)}
                    disabled={equipment.status !== 'available'}
                  >
                    Request Equipment
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsReportDialogOpen(true)}
                    disabled={equipment.status === 'damaged'}
                  >
                    Report Damage
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* History and Other Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs defaultValue="history">
            <TabsList className="border-b p-0 h-auto">
              <TabsTrigger value="history" className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Usage History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="p-6">
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No history records found for this equipment.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {format(new Date(entry.timestamp), 'dd MMM yyyy, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">
                              {entry.action.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>{entry.userName}</TableCell>
                          <TableCell>
                            {entry.action === 'status_changed' && (
                              <span>
                                Status changed from <span className="capitalize">{entry.fromStatus}</span> to <span className="capitalize">{entry.toStatus}</span>
                              </span>
                            )}
                            {entry.action === 'moved' && (
                              <span>
                                Moved from {entry.fromLocation} to {entry.toLocation}
                              </span>
                            )}
                            {entry.action === 'assigned' && (
                              <span>
                                Assigned for use
                              </span>
                            )}
                            {entry.action === 'returned' && (
                              <span>
                                Returned to inventory
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.notes ? entry.notes : <span className="text-gray-400">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Equipment Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <p className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusBadgeColor(equipment.status)}`}>
                {equipment.status === 'available' ? 'Available' : 
                 equipment.status === 'in-use' ? 'In Use' : 'Damaged'}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as EquipmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Enter notes about this status change"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Location Dialog */}
      <Dialog open={isUpdateLocationDialogOpen} onOpenChange={setIsUpdateLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Equipment Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Location</label>
              <p>{equipment.location}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Location</label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Enter notes about this location change"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation} disabled={!selectedLocation || selectedLocation === equipment.location}>
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Equipment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{equipment.assignedTo ? 'Reassign Equipment' : 'Assign Equipment'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {equipment.assignedTo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Currently Assigned To</label>
                <p>{users.find(u => u.id === equipment.assignedTo)?.name || 'Unknown User'}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {equipment.assignedTo ? 'Reassign To' : 'Assign To'}
              </label>
              <Select
                value={selectedAssignee}
                onValueChange={setSelectedAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Return to Inventory)</SelectItem>
                  {users.filter(u => u.role === 'nurse').map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name} - {user.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Enter notes about this assignment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={equipment.assignedTo === selectedAssignee}
            >
              {selectedAssignee ? 'Assign Equipment' : 'Return to Inventory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Equipment Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Equipment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <p>{equipment.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Request</label>
              <Textarea
                placeholder="Explain why you need this equipment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequest} disabled={!notes.trim()}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Damage Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Equipment Damage</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <p>{equipment.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Damage Description</label>
              <Textarea
                placeholder="Describe the damage or issue in detail"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReportDamage} disabled={!notes.trim()}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EquipmentDetail;
