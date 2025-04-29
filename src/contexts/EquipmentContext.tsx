
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Equipment, 
  EquipmentHistory, 
  EquipmentStatus, 
  EquipmentCategory,
  DamageReport,
  EquipmentRequest,
  Notification
} from '@/types';
import { 
  equipments as initialEquipment, 
  equipmentHistory as initialHistory,
  categories as initialCategories,
  damageReports as initialDamageReports,
  equipmentRequests as initialRequests,
  notifications as initialNotifications
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface EquipmentContextType {
  equipment: Equipment[];
  history: EquipmentHistory[];
  categories: EquipmentCategory[];
  damageReports: DamageReport[];
  equipmentRequests: EquipmentRequest[];
  notifications: Notification[];
  
  addEquipment: (newEquipment: Omit<Equipment, 'id'>) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus, userId: string, userName: string, notes: string) => void;
  updateEquipmentLocation: (id: string, location: string, userId: string, userName: string, notes: string) => void;
  assignEquipment: (id: string, assignedTo: string | null, userId: string, userName: string, notes: string) => void;
  
  getEquipmentById: (id: string) => Equipment | undefined;
  getEquipmentHistoryById: (id: string) => EquipmentHistory[];
  
  addCategory: (newCategory: Omit<EquipmentCategory, 'id'>) => void;
  updateCategory: (id: string, updatedCategory: Partial<EquipmentCategory>) => void;
  deleteCategory: (id: string) => void;
  
  reportDamage: (damageReport: Omit<DamageReport, 'id' | 'status'>) => void;
  updateDamageReportStatus: (id: string, status: DamageReport['status'], notes?: string) => void;
  
  requestEquipment: (request: Omit<EquipmentRequest, 'id' | 'status' | 'approvedDate' | 'completedDate'>) => void;
  updateRequestStatus: (id: string, status: EquipmentRequest['status'], notes?: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  getUnreadNotificationsForUser: (userId: string) => Notification[];
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [history, setHistory] = useState<EquipmentHistory[]>(initialHistory);
  const [categories, setCategories] = useState<EquipmentCategory[]>(initialCategories);
  const [damageReports, setDamageReports] = useState<DamageReport[]>(initialDamageReports);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const { toast } = useToast();

  // Generate a simple ID 
  const generateId = () => Date.now().toString();

  const addEquipment = (newEquipment: Omit<Equipment, 'id'>) => {
    const equipmentWithId = { ...newEquipment, id: generateId() };
    setEquipment([...equipment, equipmentWithId]);
    toast({
      title: "Equipment Added",
      description: `${newEquipment.name} has been added to inventory.`,
    });
  };

  const updateEquipmentStatus = (id: string, status: EquipmentStatus, userId: string, userName: string, notes: string) => {
    const item = equipment.find(e => e.id === id);
    if (!item) return;

    const updatedEquipment = equipment.map(e => 
      e.id === id ? { ...e, status } : e
    );

    const historyEntry: EquipmentHistory = {
      id: generateId(),
      equipmentId: id,
      userId,
      userName,
      action: 'status_changed',
      fromStatus: item.status,
      toStatus: status,
      timestamp: new Date().toISOString(),
      notes
    };

    setEquipment(updatedEquipment);
    setHistory([...history, historyEntry]);

    toast({
      title: "Status Updated",
      description: `${item.name} status changed to ${status}.`,
    });
  };

  const updateEquipmentLocation = (id: string, location: string, userId: string, userName: string, notes: string) => {
    const item = equipment.find(e => e.id === id);
    if (!item) return;

    const updatedEquipment = equipment.map(e => 
      e.id === id ? { ...e, location } : e
    );

    const historyEntry: EquipmentHistory = {
      id: generateId(),
      equipmentId: id,
      userId,
      userName,
      action: 'moved',
      fromLocation: item.location,
      toLocation: location,
      timestamp: new Date().toISOString(),
      notes
    };

    setEquipment(updatedEquipment);
    setHistory([...history, historyEntry]);

    toast({
      title: "Location Updated",
      description: `${item.name} moved to ${location}.`,
    });
  };

  const assignEquipment = (id: string, assignedTo: string | null, userId: string, userName: string, notes: string) => {
    const item = equipment.find(e => e.id === id);
    if (!item) return;

    const status: EquipmentStatus = assignedTo ? 'in-use' : 'available';

    const updatedEquipment = equipment.map(e => 
      e.id === id ? { ...e, assignedTo, status } : e
    );

    const historyEntry: EquipmentHistory = {
      id: generateId(),
      equipmentId: id,
      userId,
      userName,
      action: assignedTo ? 'assigned' : 'returned',
      fromStatus: item.status,
      toStatus: status,
      timestamp: new Date().toISOString(),
      notes
    };

    setEquipment(updatedEquipment);
    setHistory([...history, historyEntry]);

    toast({
      title: assignedTo ? "Equipment Assigned" : "Equipment Returned",
      description: assignedTo ? 
        `${item.name} has been assigned.` : 
        `${item.name} has been returned to inventory.`,
    });
  };

  const getEquipmentById = (id: string) => {
    return equipment.find(e => e.id === id);
  };

  const getEquipmentHistoryById = (id: string) => {
    return history.filter(h => h.equipmentId === id);
  };

  const addCategory = (newCategory: Omit<EquipmentCategory, 'id'>) => {
    const categoryWithId = { ...newCategory, id: generateId() };
    setCategories([...categories, categoryWithId]);
    toast({
      title: "Category Added",
      description: `${newCategory.name} category has been created.`,
    });
  };

  const updateCategory = (id: string, updatedCategory: Partial<EquipmentCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updatedCategory } : cat
    ));
    toast({
      title: "Category Updated",
      description: "Category details have been updated.",
    });
  };

  const deleteCategory = (id: string) => {
    // Check if any equipment is using this category
    const inUse = equipment.some(e => e.category === categories.find(c => c.id === id)?.name);
    
    if (inUse) {
      toast({
        title: "Cannot Delete Category",
        description: "This category is in use by one or more equipment items.",
        variant: "destructive"
      });
      return;
    }
    
    setCategories(categories.filter(cat => cat.id !== id));
    toast({
      title: "Category Deleted",
      description: "The category has been removed.",
    });
  };

  const reportDamage = (report: Omit<DamageReport, 'id' | 'status'>) => {
    const reportWithId: DamageReport = {
      ...report,
      id: generateId(),
      status: 'reported'
    };
    
    setDamageReports([...damageReports, reportWithId]);
    
    // Update equipment status to damaged
    updateEquipmentStatus(
      report.equipmentId, 
      'damaged', 
      report.reporterId, 
      report.reporterName, 
      report.description
    );
    
    toast({
      title: "Damage Reported",
      description: "Your damage report has been submitted successfully.",
    });
  };

  const updateDamageReportStatus = (id: string, status: DamageReport['status'], notes?: string) => {
    const report = damageReports.find(r => r.id === id);
    if (!report) return;

    const updatedReports = damageReports.map(r => 
      r.id === id ? { 
        ...r, 
        status, 
        ...(status === 'resolved' ? { resolvedDate: new Date().toISOString() } : {}),
        ...(notes ? { notes: r.notes + '\n' + notes } : {})
      } : r
    );
    
    setDamageReports(updatedReports);
    
    // If resolved, update equipment status to available
    if (status === 'resolved') {
      const item = equipment.find(e => e.id === report.equipmentId);
      if (item) {
        updateEquipmentStatus(item.id, 'available', '1', 'System', 'Automatically marked as available after repair');
        
        // Create notification for reporter
        addNotification({
          userId: report.reporterId,
          title: "Equipment Repaired",
          message: `${item.name} has been repaired and is now available.`,
          type: "equipment_repaired",
          relatedEquipmentId: item.id
        });
      }
    }
    
    toast({
      title: "Report Status Updated",
      description: `Damage report status changed to ${status}.`,
    });
  };

  const requestEquipment = (request: Omit<EquipmentRequest, 'id' | 'status' | 'approvedDate' | 'completedDate'>) => {
    const requestWithId: EquipmentRequest = {
      ...request,
      id: generateId(),
      status: 'pending',
    };
    
    setEquipmentRequests([...equipmentRequests, requestWithId]);
    
    toast({
      title: "Request Submitted",
      description: "Your equipment request has been submitted successfully.",
    });
  };

  const updateRequestStatus = (id: string, status: EquipmentRequest['status'], notes?: string) => {
    const request = equipmentRequests.find(r => r.id === id);
    if (!request) return;

    const updatedRequests = equipmentRequests.map(r => 
      r.id === id ? { 
        ...r, 
        status,
        ...(status === 'approved' ? { approvedDate: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { completedDate: new Date().toISOString() } : {}),
        ...(notes ? { notes: r.notes + '\n' + notes } : {})
      } : r
    );
    
    setEquipmentRequests(updatedRequests);
    
    if (status === 'approved') {
      // Create notification for requester
      const item = equipment.find(e => e.id === request.equipmentId);
      if (item) {
        addNotification({
          userId: request.requesterId,
          title: "Request Approved",
          message: `Your request for ${item.name} has been approved.`,
          type: "request_approved",
          relatedEquipmentId: item.id
        });
      }
    }
    
    toast({
      title: "Request Status Updated",
      description: `Request status changed to ${status}.`,
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications([...notifications, newNotification]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const getUnreadNotificationsForUser = (userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.isRead);
  };

  return (
    <EquipmentContext.Provider value={{
      equipment,
      history,
      categories,
      damageReports,
      equipmentRequests,
      notifications,
      
      addEquipment,
      updateEquipmentStatus,
      updateEquipmentLocation,
      assignEquipment,
      
      getEquipmentById,
      getEquipmentHistoryById,
      
      addCategory,
      updateCategory,
      deleteCategory,
      
      reportDamage,
      updateDamageReportStatus,
      
      requestEquipment,
      updateRequestStatus,
      
      addNotification,
      markNotificationAsRead,
      getUnreadNotificationsForUser
    }}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};
