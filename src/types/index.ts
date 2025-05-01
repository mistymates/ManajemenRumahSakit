
export type EquipmentStatus = 'available' | 'in-use' | 'damaged';

export type UserRole = 'inventory_manager' | 'logistics_staff' | 'nurse';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  department: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: EquipmentStatus;
  location: string;
  assignedTo: string | null;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  purchaseDate: string;
  notes: string;
}

export interface EquipmentHistory {
  id: string;
  equipmentId: string;
  userId: string;
  userName: string;
  action: 'assigned' | 'returned' | 'moved' | 'reported' | 'status_changed';
  fromStatus?: EquipmentStatus;
  toStatus?: EquipmentStatus;
  fromLocation?: string;
  toLocation?: string;
  timestamp: string;
  notes: string;
}

export interface EquipmentRequest {
  id: string;
  equipmentId: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  requestDate: string;
  approvedDate?: string;
  completedDate?: string;
  reason: string;
  notes: string;
}

export interface DamageReport {
  id: string;
  equipmentId: string;
  reporterId: string;
  reporterName: string;
  reportDate: string;
  description: string;
  status: 'reported' | 'in-repair' | 'resolved';
  resolvedDate?: string;
  notes: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'equipment_available' | 'request_approved' | 'equipment_repaired' | 'maintenance_due';
  relatedEquipmentId?: string;
}

export interface Department {
  id: string;
  name: string;
  location: string;
}

export interface Location {
  id: string;
  name: string;
  department: string;
}
