
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useEquipment } from '@/contexts/EquipmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

const Requests = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { 
    equipmentRequests, 
    updateRequestStatus,
    getEquipmentById
  } = useEquipment();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'denied' | 'completed'>('approved');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const filteredRequests = equipmentRequests.filter(request => {
    // If user is a nurse, only show their own requests
    if (user.role === 'nurse' && request.requesterId !== user.id) {
      return false;
    }
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Filter by search query
    const equipment = getEquipmentById(request.equipmentId);
    const matchesSearch = searchQuery === '' || 
      (equipment && equipment.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      request.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = () => {
    if (!selectedRequestId || !newStatus) return;
    
    updateRequestStatus(selectedRequestId, newStatus, statusNotes);
    setSelectedRequestId(null);
    setNewStatus('approved');
    setStatusNotes('');
    setIsUpdateStatusDialogOpen(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipment Requests</h1>
          {hasRole('nurse') && (
            <Button onClick={() => navigate('/requests/new')}>
              New Request
            </Button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Requests
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by equipment name, requester, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No equipment requests found matching the current filters.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests
                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                    .map((request) => {
                    const equipment = getEquipmentById(request.equipmentId);
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {format(new Date(request.requestDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {equipment ? (
                            <span className="font-medium">{equipment.name}</span>
                          ) : (
                            <span className="text-gray-500">Unknown Equipment</span>
                          )}
                        </TableCell>
                        <TableCell>{request.requesterName}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigate(`/equipment/${request.equipmentId}`);
                              }}
                            >
                              View
                            </Button>
                            
                            {hasRole(['manager', 'logistics_staff']) && request.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequestId(request.id);
                                  setIsUpdateStatusDialogOpen(true);
                                }}
                              >
                                Update
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRequestId && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Enter notes about this decision"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                  />
                </div>
                
                {newStatus === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-sm text-green-800">
                      Approving this request will automatically send a notification to the requester.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Requests;
