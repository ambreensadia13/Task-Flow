
import React, { useEffect, useState } from "react";

// Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TaskModal from "./components/TaskModal";

// Pages
import Dashboard from "./pages/Dashboard";
import AllTasks from "./pages/AllTasks";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Backend API
import {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
} from "./api";

// ======================================================
// LOCAL STORAGE KEYS
// ======================================================

const PROFILE_KEY = "taskflow_profile";
const SETTINGS_KEY = "taskflow_settings";
const NOTIFICATIONS_KEY = "taskflow_notifications";

// ======================================================
// DEFAULT PROFILE
// ======================================================

const defaultProfile = {
    name: "",
    email: "",
    role: "",
    bio: "",
    picture: ""
};

// ======================================================
// DEFAULT SETTINGS
// ======================================================

const defaultSettings = {
    theme: "light"
};

// ======================================================
// SAFE PROFILE LOADING
// ======================================================

function getSavedProfile() {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);

        if (!saved) {
            return { ...defaultProfile };
        }

        return {
            ...defaultProfile,
            ...JSON.parse(saved)
        };
    } catch (error) {
        console.error("Unable to load profile:", error);
        return { ...defaultProfile };
    }
}

// ======================================================
// SAFE SETTINGS LOADING
// ======================================================

function getSavedSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);

        if (!saved) {
            return { ...defaultSettings };
        }

        const parsed = JSON.parse(saved);

        return {
            ...defaultSettings,
            ...parsed,
            theme: parsed.theme === "dark" ? "dark" : "light"
        };
    } catch (error) {
        console.error("Unable to load settings:", error);
        return { ...defaultSettings };
    }
}

// ======================================================
// SAFE NOTIFICATION LOADING
// ======================================================

function getSavedNotifications() {
    try {
        const saved = localStorage.getItem(NOTIFICATIONS_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Unable to load notifications:", error);
        return [];
    }
}

// ======================================================
// MAIN APPLICATION
// ======================================================

function App() {

    // ==================================================
    // GLOBAL APPLICATION STATE
    // ==================================================

    const [activePage, setActivePage] = useState("Dashboard");

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Tasks are now loaded from PostgreSQL
    const [tasks, setTasks] = useState([]);

    const [tasksLoading, setTasksLoading] = useState(true);

    const [taskError, setTaskError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);

    const [editingTask, setEditingTask] = useState(null);

    // Profile
    const [profile, setProfile] = useState(() => getSavedProfile());

    const [profileOpen, setProfileOpen] = useState(false);

    // Settings
    const [settings, setSettings] = useState(() => getSavedSettings());

    // Notifications
    const [notifications, setNotifications] = useState(
        () => getSavedNotifications()
    );

    // ==================================================
    // LOAD TASKS FROM POSTGRESQL
    // ==================================================

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setTasksLoading(true);
                setTaskError("");

                const savedTasks = await fetchTasks();

                setTasks(savedTasks);
            } catch (error) {
                console.error("Failed to load tasks:", error);

                setTaskError(
                    "Unable to load tasks. Please check your backend connection."
                );
            } finally {
                setTasksLoading(false);
            }
        };

        loadTasks();
    }, []);

    // ==================================================
    // LOCAL STORAGE: SAVE SETTINGS
    // ==================================================

    useEffect(() => {
        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.error("Unable to save settings:", error);
        }
    }, [settings]);

    // ==================================================
    // LOCAL STORAGE: SAVE PROFILE
    // ==================================================

    useEffect(() => {
        try {
            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(profile)
            );
        } catch (error) {
            console.error("Unable to save profile:", error);
        }
    }, [profile]);

    // ==================================================
    // LOCAL STORAGE: SAVE NOTIFICATIONS
    // ==================================================

    useEffect(() => {
        try {
            localStorage.setItem(
                NOTIFICATIONS_KEY,
                JSON.stringify(notifications)
            );
        } catch (error) {
            console.error("Unable to save notifications:", error);
        }
    }, [notifications]);

    // ==================================================
    // NOTIFICATION MANAGEMENT
    // ==================================================

    const addNotification = (notification) => {
        setNotifications((previous) => {

            if (
                notification.id &&
                previous.some((item) => item.id === notification.id)
            ) {
                return previous;
            }

            const newNotification = {
                id: notification.id ||
                    `notification-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 8)}`,
                createdAt: new Date().toISOString(),
                read: false,
                ...notification
            };

            return [
                newNotification,
                ...previous
            ].slice(0, 50);
        });
    };

    // Mark one notification as read
    const handleMarkNotificationRead = (notificationId) => {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    // Mark all notifications as read
    const handleMarkAllNotificationsRead = () => {
        setNotifications((previous) =>
            previous.map((notification) => ({
                ...notification,
                read: true
            }))
        );
    };

    // Delete one notification
    const handleDeleteNotification = (notificationId) => {
        setNotifications((previous) =>
            previous.filter(
                (notification) => notification.id !== notificationId
            )
        );
    };

    // Clear all notifications
    const handleClearNotifications = () => {
        setNotifications([]);
    };

    // ==================================================
    // TASK MODAL MANAGEMENT
    // ==================================================

    const handleAddTask = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task) => {
        if (!task) return;

        setEditingTask(task);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingTask(null);
    };

    // ==================================================
    // CREATE OR UPDATE TASK USING BACKEND API
    // ==================================================

    const handleSaveTask = async (taskData) => {
        if (!taskData) return;

        try {
            setTaskError("");

            if (editingTask) {

                // UPDATE EXISTING TASK IN DATABASE
                const updatedTask = await updateTask(
                    editingTask.id,
                    taskData
                );

                setTasks((previousTasks) =>
                    previousTasks.map((task) =>
                        task.id === editingTask.id
                            ? updatedTask
                            : task
                    )
                );

            } else {

                // CREATE NEW TASK IN DATABASE
                const newTask = await createTask({
                    ...taskData,
                    title: taskData.title?.trim() || "Untitled Task",
                    description: taskData.description || "",
                    category: taskData.category || "Personal",
                    priority: taskData.priority || "Medium",
                    status: taskData.status || "Pending",
                    dueDate: taskData.dueDate || ""
                });

                setTasks((previousTasks) => [
                    newTask,
                    ...previousTasks
                ]);

                // Notify user about new task
                addNotification({
                    type: "task",
                    title: "Task created successfully",
                    message: `"${newTask.title}" has been added to your tasks.`,
                    taskId: newTask.id
                });
            }

            handleCloseModal();

        } catch (error) {
            console.error("Unable to save task:", error);

            setTaskError(
                error.message || "Unable to save task. Please try again."
            );
        }
    };

    // ==================================================
    // DELETE TASK FROM DATABASE
    // ==================================================

    const handleDeleteTask = async (taskId) => {
        if (!taskId) return;

        try {
            setTaskError("");

            await deleteTask(taskId);

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== taskId)
            );

        } catch (error) {
            console.error("Unable to delete task:", error);

            setTaskError(
                error.message || "Unable to delete task. Please try again."
            );
        }
    };

    // ==================================================
    // COMPLETE / REOPEN TASK IN DATABASE
    // ==================================================

    const handleToggleTask = async (taskId) => {
        if (!taskId) return;

        const selectedTask = tasks.find(
            (task) => task.id === taskId
        );

        if (!selectedTask) return;

        const newStatus =
            selectedTask.status === "Completed"
                ? "Pending"
                : "Completed";

        try {
            setTaskError("");

            const updatedTask = await updateTask(taskId, {
                status: newStatus
            });

            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task.id === taskId
                        ? updatedTask
                        : task
                )
            );

        } catch (error) {
            console.error("Unable to update task status:", error);

            setTaskError(
                error.message || "Unable to update task status."
            );
        }
    };

    // ==================================================
    // AUTOMATIC DEADLINE REMINDERS
    // ==================================================

    useEffect(() => {

        // Wait until database tasks have loaded
        if (tasksLoading) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminders = [];

        tasks.forEach((task) => {

            if (
                !task.dueDate ||
                task.status === "Completed"
            ) {
                return;
            }

            const dateText = String(task.dueDate).slice(0, 10);

            const dueDate = new Date(`${dateText}T00:00:00`);

            if (Number.isNaN(dueDate.getTime())) {
                return;
            }

            const daysRemaining = Math.round(
                (dueDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            // Overdue tasks
            if (daysRemaining < 0) {
                reminders.push({
                    id: `overdue-${task.id}-${dateText}`,
                    type: "overdue",
                    title: "Task is overdue",
                    message: `"${task.title}" has passed its due date.`,
                    taskId: task.id
                });
            }

            // Tasks due today
            else if (daysRemaining === 0) {
                reminders.push({
                    id: `deadline-${task.id}-${dateText}`,
                    type: "deadline",
                    title: "Task due today",
                    message: `"${task.title}" is due today.`,
                    taskId: task.id
                });
            }

            // Tasks due tomorrow
            else if (daysRemaining === 1) {
                reminders.push({
                    id: `deadline-${task.id}-${dateText}`,
                    type: "deadline",
                    title: "Upcoming deadline",
                    message: `"${task.title}" is due tomorrow.`,
                    taskId: task.id
                });
            }
        });

        if (reminders.length === 0) {
            return;
        }

        setNotifications((previous) => {

            const existingIds = new Set(
                previous.map((notification) => notification.id)
            );

            const newReminders = reminders
                .filter((reminder) => !existingIds.has(reminder.id))
                .map((reminder) => ({
                    ...reminder,
                    createdAt: new Date().toISOString(),
                    read: false
                }));

            if (newReminders.length === 0) {
                return previous;
            }

            return [
                ...newReminders,
                ...previous
            ].slice(0, 50);
        });

    }, [tasks, tasksLoading]);

    // ==================================================
    // GLOBAL SEARCH
    // ==================================================

    const handleSearch = (value) => {
        setSearchQuery(value);

        if (value.trim()) {
            setActivePage("All Tasks");
        }
    };

    const handleViewAllTasks = () => {
        setSearchQuery("");
        setActivePage("All Tasks");
    };

    // ==================================================
    // PROFILE MANAGEMENT
    // ==================================================

    const handleOpenProfile = () => {
        setProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setProfileOpen(false);
    };

    const handleProfileSave = (updatedProfile) => {
        if (!updatedProfile) return;

        const newProfile = {
            ...defaultProfile,
            ...updatedProfile
        };

        setProfile(newProfile);
        setProfileOpen(false);
    };

    // ==================================================
    // SETTINGS MANAGEMENT
    // ==================================================

    const handleSettingsChange = (updatedSettings) => {
        setSettings((previous) => ({
            ...previous,
            ...updatedSettings
        }));
    };

    // ==================================================
    // PAGE RENDERING
    // ==================================================

    const renderPage = () => {

        // Dashboard
        if (activePage === "Dashboard") {
            return (
                <Dashboard
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleTask}
                    onViewAll={handleViewAllTasks}
                />
            );
        }

        // All Tasks
        if (activePage === "All Tasks") {
            return (
                <AllTasks
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleTask}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                />
            );
        }

        // Calendar

        if (activePage === "Calendar") {
            return (
                <Calendar
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onToggle={handleToggleTask}
                    onAddTask={handleAddTask}
                />
            );
        }


        // Analytics
        if (activePage === "Analytics") {
            return (
                <Analytics
                    tasks={tasks}
                />
            );
        }

        // Settings
        if (activePage === "Settings") {
            return (
                <Settings
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                />
            );
        }

        // Default page
        return (
            <Dashboard
                tasks={tasks}
                onAddTask={handleAddTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onViewAll={handleViewAllTasks}
            />
        );
    };

    // ==================================================
    // APPLICATION UI
    // ==================================================

    return (

        <div
            className={`app-layout ${settings.theme === "dark" ? "dark-theme" : ""
                }`}
        >

            {/* SIDEBAR */}

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                profile={profile}
                onProfileClick={handleOpenProfile}
            />

            {/* MAIN CONTENT */}

            <div className="main-content">

                {/* HEADER */}

                <Header
                    activePage={activePage}
                    onAddTask={handleAddTask}
                    setOpen={setSidebarOpen}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}

                    notifications={notifications}
                    onMarkNotificationRead={handleMarkNotificationRead}
                    onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                    onDeleteNotification={handleDeleteNotification}
                    onClearNotifications={handleClearNotifications}

                    onNotificationClick={(notification) => {
                        setActivePage("All Tasks");
                        setSearchQuery("");
                    }}
                />

                {/* PAGE CONTENT */}

                <main className="page-content">

                    {taskError && (
                        <div
                            role="alert"
                            style={{
                                padding: "12px 16px",
                                marginBottom: "16px",
                                borderRadius: "8px",
                                background: "#fee2e2",
                                color: "#991b1b"
                            }}
                        >
                            {taskError}
                        </div>
                    )}

                    {tasksLoading ? (
                        <div style={{ padding: "30px", textAlign: "center" }}>
                            Loading your tasks...
                        </div>
                    ) : (
                        renderPage()
                    )}

                </main>

            </div>

            {/* TASK MODAL */}

            <TaskModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                editingTask={editingTask}
            />

            {/* WORKSPACE PROFILE POPUP */}

            <Profile
                isOpen={profileOpen}
                onClose={handleCloseProfile}
                profile={profile}
                onSave={handleProfileSave}
            />

        </div>
    );
}

export default App;
