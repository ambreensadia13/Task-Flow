
import React from "react";
import {
    ListTodo,
    Clock3,
    CircleCheck,
    AlertCircle,
    ArrowUpRight,
    Plus
} from "lucide-react";

import StatCard from "../components/StatCard";

function Dashboard({
    tasks,
    onAddTask,
    onEdit,
    onDelete,
    onToggle,
    onViewAll
}) {
    const today = new Date().toISOString().slice(0, 10);

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const inProgress = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const overdue = tasks.filter(
        task =>
            task.dueDate &&
            task.dueDate < today &&
            task.status !== "Completed"
    ).length;

    const recentTasks = tasks.slice(0, 5);

    const formatDate = (date) => {
        if (!date) return "No deadline";

        return new Date(date + "T00:00:00").toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
        );
    };

    return (
        <div className="dashboard">

            <div className="welcome-banner">
                <div>
                    <span className="welcome-tag">
                        YOUR PRODUCTIVITY SPACE
                    </span>

                    <h2>Stay focused. Get things done.</h2>

                    <p>
                        Organize your priorities and make every day count.
                    </p>
                </div>

                <div className="welcome-decoration">✦</div>
            </div>

            <div className="section-heading">
                <div>
                    <h2>Overview</h2>
                    <p>Your real-time task statistics.</p>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Tasks"
                    value={total}
                    subtitle="All your tasks"
                    icon={ListTodo}
                    color="purple"
                />

                <StatCard
                    title="In Progress"
                    value={inProgress}
                    subtitle="Currently working"
                    icon={Clock3}
                    color="orange"
                />

                <StatCard
                    title="Completed"
                    value={completed}
                    subtitle="Successfully finished"
                    icon={CircleCheck}
                    color="green"
                />

                <StatCard
                    title="Overdue"
                    value={overdue}
                    subtitle="Past their deadline"
                    icon={AlertCircle}
                    color="pink"
                />
            </div>

            <div className="tasks-section">

                <div className="section-heading">
                    <div>
                        <h2>Recent Tasks</h2>
                        <p>Your latest created tasks.</p>
                    </div>

                    <button className="text-button" onClick={onViewAll}>
                        View all <ArrowUpRight size={17} />
                    </button>
                </div>

                {recentTasks.length > 0 ? (
                    <div className="task-table-wrapper">
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>
                                            <div className="task-name">
                                                <span className="task-dot" />
                                                {task.title}
                                            </div>
                                        </td>

                                        <td>{task.category}</td>

                                        <td>
                                            <span className={`priority ${task.priority.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                                                {task.status}
                                            </span>
                                        </td>

                                        <td>{formatDate(task.dueDate)}</td>

                                        <td>
                                            <div className="dashboard-actions">
                                                <button
                                                    onClick={() => onEdit(task)}
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => onToggle(task)}
                                                    title="Toggle completion"
                                                >
                                                    {task.status === "Completed"
                                                        ? "Reopen"
                                                        : "Complete"}
                                                </button>

                                                <button
                                                    className="dashboard-delete"
                                                    onClick={() => onDelete(task.id)}
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-tasks">
                        <div className="empty-icon">
                            <ListTodo size={35} />
                        </div>

                        <h3>No tasks yet!</h3>

                        <p>Create your first task and start organizing your day.</p>

                        <button className="save-button" onClick={onAddTask}>
                            <Plus size={17} />
                            Create your first task
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Dashboard;
