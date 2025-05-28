'use client';

import { Bell, Loader2, RefreshCw } from 'lucide-react';
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
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationsProps {
  workspaceId?: number;
  maxHeight?: string;
}

export default function Notifications({
  workspaceId,
  maxHeight = '400px',
}: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoadingNotifications,
    hasMoreNotifications,
    lastError,
    dismiss: dismissNotification,
    markAllRead: markAllAsRead,
    markAsRead,
    loadMoreNotifications,
    refreshNotifications,
    loadAllNotifications,
  } = useNotifications({
    workspaceId,
    autoFetch: true,
    limit: 10,
  });

  const { isConnected, connectionAttempts } = useSocket();

  const MAX_CONNECTION_ATTEMPTS = 3;

  // Load all notifications when switching to "All" view
  // useEffect(() => {
  //   if (showAllNotifications && isOpen) {
  //     loadAllNotifications();
  //   }
  // }, [showAllNotifications, isOpen, loadAllNotifications]);

  const handleNotificationClick = async (
    notificationId: string,
    isRead: boolean,
    workspaceId?: string
  ) => {
    if (!isRead) {
      await markAsRead(notificationId, workspaceId);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRefresh = () => {
    if (showAllNotifications) {
      loadAllNotifications();
    } else {
      refreshNotifications();
    }
  };

  const handleLoadMore = () => {
    loadMoreNotifications();
  };

  const displayNotifications = showAllNotifications
    ? notifications
    : unreadNotifications;

  // Format notification type for display
  const formatNotificationType = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return 'Order';
      case 'SUCCESS':
        return 'Success';
      case 'ERROR':
        return 'Error';
      case 'WARNING':
        return 'Warning';
      case 'INFO':
        return 'Info';
      case 'SYSTEM':
        return 'System';
      default:
        return type;
    }
  };

  // Get badge variant for notification type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'default';
      case 'ERROR':
        return 'destructive';
      case 'WARNING':
        return 'outline';
      case 'ORDER_UPDATE':
        return 'secondary';
      case 'INFO':
      case 'SYSTEM':
      default:
        return 'secondary';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
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

            {/* Refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingNotifications}
              className="h-auto py-0 px-1"
            >
              {isLoadingNotifications ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto py-0 px-2 text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Toggle between unread and all notifications */}
        <div className="flex gap-1 p-2">
          <Button
            variant={!showAllNotifications ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowAllNotifications(false)}
            className="flex-1 text-xs"
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={showAllNotifications ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowAllNotifications(true)}
            className="flex-1 text-xs"
          >
            All ({notifications.length})
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Error message */}
        {lastError && (
          <div className="p-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md mx-2 mb-2">
            {lastError}
          </div>
        )}

        {/* Notifications list */}
        <ScrollArea className="max-h-96">
          {displayNotifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading notifications...
                </div>
              ) : showAllNotifications ? (
                'No notifications'
              ) : (
                'No unread notifications'
              )}
            </div>
          ) : (
            <>
              {displayNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    !notification.read
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : ''
                  }`}
                  // onClick={() =>
                  //   handleNotificationClick(
                  //     notification.id,
                  //     notification.read || false
                  //   )
                  // }
                >
                  <div className="flex w-full justify-between items-start">
                    <span
                      className={`font-medium text-sm ${!notification.read ? 'text-blue-900' : ''}`}
                    >
                      {notification.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getBadgeVariant(notification.type)}
                        className="text-xs"
                      >
                        {formatNotificationType(notification.type)}
                      </Badge>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex w-full items-center justify-between text-xs text-gray-400">
                    <span>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      className="h-auto py-0 px-2 text-xs hover:bg-gray-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}

              {/* Load more button */}
              {hasMoreNotifications && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoadingNotifications}
                    className="w-full text-xs"
                  >
                    {isLoadingNotifications ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
