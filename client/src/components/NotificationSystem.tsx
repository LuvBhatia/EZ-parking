import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationSystem() {
  const { token, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Socket.IO real-time connection
  useEffect(() => {
    if (!user) return;

    const socket = io();

    socket.on("connect", () => {
      console.log("Connected to server for notifications");
      socket.emit("join_user_room", user.id);
    });

    socket.on("new_notification", (newNotification: Notification) => {
      // Update the notifications cache
      queryClient.setQueryData(["/api/notifications"], (oldData: Notification[] | undefined) => {
        return [newNotification, ...(oldData || [])];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-success" size={20} />;
      case "error":
        return <AlertCircle className="text-error" size={20} />;
      case "warning":
        return <AlertTriangle className="text-warning" size={20} />;
      default:
        return <Info className="text-primary" size={20} />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
        data-testid="button-notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            data-testid="notification-count"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
                data-testid="button-close-notifications"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm" data-testid={`notification-title-${notification.id}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600" data-testid={`notification-message-${notification.id}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
