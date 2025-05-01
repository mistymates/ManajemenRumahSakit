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

// Initial data from mock data
import { 
  users as initialUsers,
  departments as initialDepartments,
  locations as initialLocations,
  categories as initialCategories,
  equipments as initialEquipments,
  equipmentHistory as initialEquipmentHistory,
  damageReports as initialDamageReports,
  equipmentRequests as initialEquipmentRequests,
  notifications as initialNotifications
} from '@/data/mockData';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'hospital_management_users',
  DEPARTMENTS: 'hospital_management_departments',
  LOCATIONS: 'hospital_management_locations',
  CATEGORIES: 'hospital_management_categories',
  EQUIPMENTS: 'hospital_management_equipments',
  EQUIPMENT_HISTORY: 'hospital_management_equipment_history',
  DAMAGE_REPORTS: 'hospital_management_damage_reports',
  EQUIPMENT_REQUESTS: 'hospital_management_equipment_requests',
  NOTIFICATIONS: 'hospital_management_notifications',
};

// Generic function to get data from localStorage
function getData<T>(key: string, initialData: T[]): T[] {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialData;
  } catch (error) {
    console.error(`Error retrieving data for ${key}:`, error);
    return initialData;
  }
}

// Generic function to save data to localStorage
function saveData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for ${key}:`, error);
  }
}

// Initialize storage with mock data if it doesn't exist
export function initializeStorage(): void {
  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveData(STORAGE_KEYS.USERS, initialUsers);
    saveData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    saveData(STORAGE_KEYS.LOCATIONS, initialLocations);
    saveData(STORAGE_KEYS.CATEGORIES, initialCategories);
    saveData(STORAGE_KEYS.EQUIPMENTS, initialEquipments);
    saveData(STORAGE_KEYS.EQUIPMENT_HISTORY, initialEquipmentHistory);
    saveData(STORAGE_KEYS.DAMAGE_REPORTS, initialDamageReports);
    saveData(STORAGE_KEYS.EQUIPMENT_REQUESTS, initialEquipmentRequests);
    saveData(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }
}

// User data functions
export function getUsers(): User[] {
  return getData<User>(STORAGE_KEYS.USERS, initialUsers);
}

export function saveUsers(users: User[]): void {
  saveData(STORAGE_KEYS.USERS, users);
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.id === id);
}

// Department data functions
export function getDepartments(): Department[] {
  return getData<Department>(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
}

export function saveDepartments(departments: Department[]): void {
  saveData(STORAGE_KEYS.DEPARTMENTS, departments);
}

// Location data functions
export function getLocations(): Location[] {
  return getData<Location>(STORAGE_KEYS.LOCATIONS, initialLocations);
}

export function saveLocations(locations: Location[]): void {
  saveData(STORAGE_KEYS.LOCATIONS, locations);
}

// Category data functions
export function getCategories(): EquipmentCategory[] {
  return getData<EquipmentCategory>(STORAGE_KEYS.CATEGORIES, initialCategories);
}

export function saveCategories(categories: EquipmentCategory[]): void {
  saveData(STORAGE_KEYS.CATEGORIES, categories);
}

// Equipment data functions
export function getEquipments(): Equipment[] {
  return getData<Equipment>(STORAGE_KEYS.EQUIPMENTS, initialEquipments);
}

export function saveEquipments(equipments: Equipment[]): void {
  saveData(STORAGE_KEYS.EQUIPMENTS, equipments);
}

export function getEquipmentById(id: string): Equipment | undefined {
  const equipments = getEquipments();
  return equipments.find(equipment => equipment.id === id);
}

// Equipment history functions
export function getEquipmentHistory(): EquipmentHistory[] {
  return getData<EquipmentHistory>(STORAGE_KEYS.EQUIPMENT_HISTORY, initialEquipmentHistory);
}

export function saveEquipmentHistory(history: EquipmentHistory[]): void {
  saveData(STORAGE_KEYS.EQUIPMENT_HISTORY, history);
}

export function getEquipmentHistoryById(equipmentId: string): EquipmentHistory[] {
  const history = getEquipmentHistory();
  return history.filter(item => item.equipmentId === equipmentId);
}

// Damage reports functions
export function getDamageReports(): DamageReport[] {
  return getData<DamageReport>(STORAGE_KEYS.DAMAGE_REPORTS, initialDamageReports);
}

export function saveDamageReports(reports: DamageReport[]): void {
  saveData(STORAGE_KEYS.DAMAGE_REPORTS, reports);
}

// Equipment requests functions
export function getEquipmentRequests(): EquipmentRequest[] {
  return getData<EquipmentRequest>(STORAGE_KEYS.EQUIPMENT_REQUESTS, initialEquipmentRequests);
}

export function saveEquipmentRequests(requests: EquipmentRequest[]): void {
  saveData(STORAGE_KEYS.EQUIPMENT_REQUESTS, requests);
}

// Notification functions
export function getNotifications(): Notification[] {
  return getData<Notification>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
}

export function saveNotifications(notifications: Notification[]): void {
  saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function getUnreadNotificationsForUser(userId: string): Notification[] {
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === userId && !n.isRead);
}

// Generate a simple ID
export function generateId(): string {
  return Date.now().toString();
}
