import { 
  Equipment, 
  EquipmentHistory, 
  User, 
  EquipmentCategory, 
  Location, 
  Department,
  DamageReport,
  EquipmentRequest,
  Notification
} from '@/types';

export const users: User[] = [
  { id: '1', name: 'Fajar', username: 'fajar', password: 'password123', role: 'logistics_staff', department: 'Logistics' },
  { id: '2', name: 'Lailatul Hadhari', username: 'lailatul', password: 'password123', role: 'nurse', department: 'ICU' },
  { id: '3', name: 'Arya', username: 'arya', password: 'password123', role: 'inventory_manager', department: 'Administration' },
  { id: '4', name: 'Jihan Rizkyta', username: 'jihan', password: 'password123', role: 'nurse', department: 'ER' },
  { id: '5', name: 'Luis Morgan', username: 'luis', password: 'password123', role: 'logistics_staff', department: 'Pharmacy' },
];

export const departments: Department[] = [
  { id: '1', name: 'ICU', location: 'Floor 3' },
  { id: '2', name: 'ER', location: 'Floor 1' },
  { id: '3', name: 'Pediatrics', location: 'Floor 2' },
  { id: '4', name: 'Surgery', location: 'Floor 4' },
  { id: '5', name: 'Radiology', location: 'Floor 1' },
];

export const locations: Location[] = [
  { id: '1', name: 'ICU Room 301', department: 'ICU' },
  { id: '2', name: 'ICU Room 302', department: 'ICU' },
  { id: '3', name: 'ER Bay 101', department: 'ER' },
  { id: '4', name: 'ER Bay 102', department: 'ER' },
  { id: '5', name: 'Surgery Room A', department: 'Surgery' },
  { id: '6', name: 'Surgery Room B', department: 'Surgery' },
  { id: '7', name: 'Pediatrics Ward', department: 'Pediatrics' },
  { id: '8', name: 'Radiology Lab', department: 'Radiology' },
  { id: '9', name: 'Equipment Storage', department: 'Logistics' },
];

export const categories: EquipmentCategory[] = [
  { id: '1', name: 'Diagnostic', description: 'Equipment used for diagnostics purposes' },
  { id: '2', name: 'Monitoring', description: 'Equipment used for patient monitoring' },
  { id: '3', name: 'Surgical', description: 'Equipment used in surgery' },
  { id: '4', name: 'Support', description: 'Equipment used to support patient care' },
  { id: '5', name: 'Laboratory', description: 'Equipment used in laboratory procedures' },
];

export const equipments: Equipment[] = [
  {
    id: '1',
    name: 'MRI Machine',
    category: 'Diagnostic',
    serialNumber: 'MRI-2023-001',
    status: 'available',
    location: 'Radiology Lab',
    assignedTo: null,
    lastMaintenanceDate: '2023-12-15',
    nextMaintenanceDate: '2024-06-15',
    purchaseDate: '2020-05-10',
    notes: 'High-resolution imaging system'
  },
  {
    id: '2',
    name: 'Patient Monitor',
    category: 'Monitoring',
    serialNumber: 'MON-2023-124',
    status: 'in-use',
    location: 'ICU Room 301',
    assignedTo: '2',
    lastMaintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-07-20',
    purchaseDate: '2021-08-15',
    notes: 'Vital signs monitor'
  },
  {
    id: '3',
    name: 'Ventilator',
    category: 'Support',
    serialNumber: 'VEN-2022-045',
    status: 'damaged',
    location: 'Equipment Storage',
    assignedTo: null,
    lastMaintenanceDate: '2023-11-05',
    nextMaintenanceDate: '2024-05-05',
    purchaseDate: '2019-03-20',
    notes: 'Needs repair'
  },
  {
    id: '4',
    name: 'Surgical Lamp',
    category: 'Surgical',
    serialNumber: 'SL-2023-078',
    status: 'available',
    location: 'Surgery Room A',
    assignedTo: null,
    lastMaintenanceDate: '2024-02-10',
    nextMaintenanceDate: '2024-08-10',
    purchaseDate: '2022-01-15',
    notes: 'LED surgical lamp'
  },
  {
    id: '5',
    name: 'Ultrasound Machine',
    category: 'Diagnostic',
    serialNumber: 'US-2022-033',
    status: 'in-use',
    location: 'ER Bay 101',
    assignedTo: '4',
    lastMaintenanceDate: '2023-12-05',
    nextMaintenanceDate: '2024-06-05',
    purchaseDate: '2021-04-22',
    notes: 'Portable ultrasound'
  },
];

export const equipmentHistory: EquipmentHistory[] = [
  {
    id: '1',
    equipmentId: '2',
    userId: '2',
    userName: 'Lailatul Hadhari',
    action: 'assigned',
    fromStatus: 'available',
    toStatus: 'in-use',
    timestamp: '2024-04-01T08:30:00',
    notes: 'Assigned for patient monitoring'
  },
  {
    id: '2',
    equipmentId: '3',
    userId: '5',
    userName: 'Arya Kamal',
    action: 'status_changed',
    fromStatus: 'in-use',
    toStatus: 'damaged',
    timestamp: '2024-03-25T14:15:00',
    notes: 'Reported malfunction in air delivery system'
  },
  {
    id: '3',
    equipmentId: '5',
    userId: '4',
    userName: 'Jihan Rizkyta',
    action: 'assigned',
    fromStatus: 'available',
    toStatus: 'in-use',
    timestamp: '2024-04-02T10:45:00',
    notes: 'Required for emergency diagnosis'
  },
  {
    id: '4',
    equipmentId: '1',
    userId: '1',
    userName: 'Luis Morgan',
    action: 'moved',
    fromLocation: 'Equipment Storage',
    toLocation: 'Radiology Lab',
    timestamp: '2024-03-20T09:00:00',
    notes: 'Relocated after maintenance'
  },
];

export const damageReports: DamageReport[] = [
  {
    id: '1',
    equipmentId: '3',
    reporterId: '2',
    reporterName: 'Lailatul Hadhari',
    reportDate: '2024-03-25T13:45:00',
    description: 'Ventilator not maintaining proper pressure levels',
    status: 'in-repair',
    notes: 'Technician scheduled for next week'
  }
];

export const equipmentRequests: EquipmentRequest[] = [
  {
    id: '1',
    equipmentId: '4',
    requesterId: '4',
    requesterName: 'Jihan Rizkyta',
    status: 'pending',
    requestDate: '2024-04-05T11:20:00',
    reason: 'Needed for emergency procedure in ER',
    notes: 'High priority'
  }
];

export const notifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Equipment Available',
    message: 'Patient Monitor is now available for use',
    isRead: false,
    createdAt: '2024-04-03T16:30:00',
    type: 'equipment_available',
    relatedEquipmentId: '1'
  },
  {
    id: '2',
    userId: '4',
    title: 'Request Approved',
    message: 'Your request for Surgical Lamp has been approved',
    isRead: true,
    createdAt: '2024-04-04T09:15:00',
    type: 'request_approved',
    relatedEquipmentId: '4'
  }
];
