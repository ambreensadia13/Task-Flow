
import React, { useState } from "react";
import {
    Search,
    Bell,
    Plus,
    Menu,
    CheckCircle2,
    CalendarClock,
    AlertCircle,
    Info,
    Check,
    Trash2,
    X,
    BellRing
} from "lucide-react";

function Header({
    activePage,
    onAddTask,
    setOpen,
    searchQuery,
    onSearchChange,
    notifications = [],
    onMarkNotificationRead,
    onMarkAllNotificationsRead,
    onDeleteNotification,
    onClearNotifications,
    onNotificationClick
}) {
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case "task":
                return <CheckCircle2 size={19} />;

            case "deadline":
                return <CalendarClock size={19} />;

            case "overdue":
                return <AlertCircle size={19} />;

            default:
                return <Info size={19} />;
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case "task":
                return "notification-icon-task";

            case "deadline":
                return "notification-icon-deadline";

            case "overdue":
                return "notification-icon-overdue";

            default:
                return "notification-icon-default";
        }
    };

    const formatNotificationTime = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read && onMarkNotificationRead) {
            onMarkNotificationRead(notification.id);
        }

        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        setShowNotifications(false);
    };

    return (
        <header className="top-header">

            <div className="header-left">

                <button
                    className="mobile-menu"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={23} />
                </button>

                <div>
                    <h1>{activePage}</h1>
                    <p>Welcome back! Let's make today productive.</p>
                </div>

            </div>


            <div className="header-actions">

                {/* GLOBAL SEARCH */}

                <div className="header-search">
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search tasks"
                    />
                </div>


                {/* NOTIFICATION CENTER */}

                <div className="notification-wrapper">

                    <button
                        className={`icon-button notification-button ${showNotifications ? "notification-active" : ""
                            }`}
                        onClick={() =>
                            setShowNotifications((previous) => !previous)
                        }
                        aria-label={`Notifications, ${unreadCount} unread`}
                        aria-expanded={showNotifications}
                    >
                        <Bell size={20} />

                        {unreadCount > 0 && (
                            <span className="notification-count">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>


                    {showNotifications && (
                        <div className="notification-dropdown">

                            {/* PANEL HEADER */}

                            <div className="notification-panel-header">

                                <div>
                                    <h3>Notifications</h3>

                                    <p>
                                        {unreadCount > 0
                                            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                            : "You're all caught up"}
                                    </p>
                                </div>

                                <button
                                    className="notification-close"
                                    onClick={() => setShowNotifications(false)}
                                    aria-label="Close notifications"
                                >
                                    <X size={18} />
                                </button>

                            </div>


                            {/* PANEL ACTIONS */}

                            {notifications.length > 0 && (
                                <div className="notification-toolbar">

                                    <button
                                        onClick={onMarkAllNotificationsRead}
                                        disabled={unreadCount === 0}
                                    >
                                        <Check size={15} />
                                        Mark all as read
                                    </button>

                                    <button
                                        onClick={onClearNotifications}
                                    >
                                        <Trash2 size={15} />
                                        Clear all
                                    </button>

                                </div>
                            )}


                            {/* NOTIFICATION LIST */}

                            <div className="notification-list">

                                {notifications.length === 0 ? (

                                    <div className="notification-empty">
                                        <div className="notification-empty-icon">
                                            <BellRing size={27} />
                                        </div>

                                        <h4>No notifications yet</h4>

                                        <p>
                                            Task updates and deadline reminders
                                            will appear here.
                                        </p>
                                    </div>

                                ) : (

                                    notifications.map((notification) => (

                                        <div
                                            key={notification.id}
                                            className={`notification-item ${notification.read
                                                    ? "is-read"
                                                    : "is-unread"
                                                }`}
                                        >

                                            <button
                                                className={`notification-item-main ${getNotificationClass(notification.type)}`}
                                                onClick={() =>
                                                    handleNotificationClick(notification)
                                                }
                                            >

                                                <span className="notification-item-icon">
                                                    {getNotificationIcon(notification.type)}
                                                </span>

                                                <span className="notification-item-content">

                                                    <strong>
                                                        {notification.title}
                                                    </strong>

                                                    <span>
                                                        {notification.message}
                                                    </span>

                                                    <small>
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </small>

                                                </span>

                                                {!notification.read && (
                                                    <span className="notification-unread-indicator"></span>
                                                )}

                                            </button>


                                            <button
                                                className="notification-delete"
                                                onClick={() =>
                                                    onDeleteNotification?.(
                                                        notification.id
                                                    )
                                                }
                                                aria-label="Delete notification"
                                            >
                                                <Trash2 size={15} />
                                            </button>

                                        </div>

                                    ))

                                )}

                            </div>

                        </div>
                    )}

                </div>


                {/* NEW TASK BUTTON */}

                <button
                    className="primary-button"
                    onClick={onAddTask}
                >
                    <Plus size={19} />
                    <span>New Task</span>
                </button>

            </div>

        </header>
    );
}

export default Header;
