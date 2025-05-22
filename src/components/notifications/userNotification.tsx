'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/socket/useNotifications';
import { useSocket } from '@/hooks/socket/useSocket';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    dismiss: dismissNotification,
    markAllRead: markAllAsRead,
  } = useNotifications();

  const { isConnected, connectionAttempts } = useSocket();

  const MAX_CONNECTION_ATTEMPTS = 3;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            {/* Connection status indicator */}
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? 'bg-green-500'
                  : connectionAttempts > 0
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto py-0 px-2 text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-3 cursor-default"
            >
              <div className="flex w-full justify-between">
                <span className="font-medium">{notification.title}</span>
                <Badge
                  variant={
                    notification.type === 'SUCCESS'
                      ? 'default'
                      : notification.type === 'ERROR'
                        ? 'destructive'
                        : notification.type === 'WARNING'
                          ? 'outline'
                          : 'secondary'
                  }
                  className="text-xs"
                >
                  {notification.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
              <div className="mt-2 flex w-full items-center justify-between text-xs text-gray-400">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-auto py-0 px-2 text-xs hover:bg-gray-100"
                >
                  Dismiss
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
