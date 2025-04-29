
import React from 'react';
import { useEquipment } from '@/contexts/EquipmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useEquipment();

  if (!user) return null;

  const userNotifications = notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'equipment_available':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">✓</div>;
      case 'request_approved':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">✓</div>;
      case 'equipment_repaired':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">↻</div>;
      case 'maintenance_due':
        return <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">!</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">i</div>;
    }
  };

  return (
    <div 
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`px-4 py-3 border-b hover:bg-gray-50 flex items-start ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="mr-3">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{notification.title}</div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
