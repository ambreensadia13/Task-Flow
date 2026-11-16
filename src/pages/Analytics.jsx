
import React, { useMemo } from "react";
import {
    ListTodo,
    CheckCircle2,
    Clock3,
    AlertCircle,
    TrendingUp,
    CalendarDays
} from "lucide-react";

const categories = [
    "Personal",
    "Study",
    "Work",
    "Development",
    "Projects",
    "Other"
];

const priorities = ["Urgent", "High", "Medium", "Low"];

function Analytics({ tasks = [] }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDateKey = (date) => {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    };

    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    );

    const pendingTasks = tasks.filter(
        task => task.status === "Pending"
    );

    const inProgressTasks = tasks.filter(
        task => task.status === "In Progress"
    );

    const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === "Completed") {
            return false;
        }

        return task.dueDate < getDateKey(today);
    });

    const completionRate = tasks.length
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === "Completed") {
            return false;
        }

        const dueDate = new Date(task.dueDate + "T00:00:00");

        const daysFromToday = Math.round(
            (dueDate - today) / (1000 * 60 * 60 * 24)
        );

        return daysFromToday >= 0 && daysFromToday <= 7;
    });

    const categoryData = categories.map(category => ({
        name: category,
        count: tasks.filter(task => task.category === category).length
    }));

    const priorityData = priorities.map(priority => ({
        name: priority,
        count: tasks.filter(task => task.priority === priority).length
    }));

    const maxCategory = Math.max(
        1,
        ...categoryData.map(item => item.count)
    );

    const maxPriority = Math.max(
        1,
        ...priorityData.map(item => item.count)
    );

    const weeklyData = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);

            // Monday through Sunday
            const currentDay = (today.getDay() + 6) % 7;

            date.setDate(today.getDate() - currentDay + index);

            const dateKey = getDateKey(date);

            const count = tasks.filter(task => {
                if (!task.createdAt) return false;

                const createdDate = new Date(task.createdAt);

                if (Number.isNaN(createdDate.getTime())) {
                    return false;
                }

                return getDateKey(createdDate) === dateKey;
            }).length;

            return {
                day: date.toLocaleDateString("en-US", {
                    weekday: "short"
                }),
                date: dateKey,
                count
            };
        });
    }, [tasks]);

    const maxWeekly = Math.max(
        1,
        ...weeklyData.map(item => item.count)
    );

    const formatDate = (dateString) => {
        return new Date(dateString + "T00:00:00").toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );
    };

    return (
        <section className="analytics-page">

            <div className="analytics-intro">
                <div>
                    <h2>Productivity Analytics</h2>
                    <p>Understand your progress and improve your productivity.</p>
                </div>

                <span className="analytics-period">
                    <CalendarDays size={16} />
                    All-time overview
                </span>
            </div>

            {/* SUMMARY CARDS */}

            <div className="analytics-stats">

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon stat-purple">
                        <ListTodo size={22} />
                    </div>
                    <div>
                        <span>Total Tasks</span>
                        <h3>{tasks.length}</h3>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon stat-green">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <span>Completed</span>
                        <h3>{completedTasks.length}</h3>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon stat-orange">
                        <Clock3 size={22} />
                    </div>
                    <div>
                        <span>Pending</span>
                        <h3>{pendingTasks.length + inProgressTasks.length}</h3>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon stat-red">
                        <AlertCircle size={22} />
                    </div>
                    <div>
                        <span>Overdue</span>
                        <h3>{overdueTasks.length}</h3>
                    </div>
                </div>

            </div>

            {/* COMPLETION OVERVIEW */}

            <div className="analytics-main-grid">

                <div className="analytics-panel completion-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Completion Overview</h3>
                            <p>Your overall task completion rate</p>
                        </div>
                        <TrendingUp size={21} />
                    </div>

                    <div className="completion-content">

                        <div
                            className="completion-circle"
                            style={{
                                "--completion": `${completionRate}%`
                            }}
                        >
                            <div className="completion-circle-inner">
                                <strong>{completionRate}%</strong>
                                <span>Completed</span>
                            </div>
                        </div>

                        <div className="completion-details">

                            <div>
                                <span className="analytics-dot dot-completed"></span>
                                <p>Completed</p>
                                <strong>{completedTasks.length}</strong>
                            </div>

                            <div>
                                <span className="analytics-dot dot-pending"></span>
                                <p>Pending</p>
                                <strong>{pendingTasks.length}</strong>
                            </div>

                            <div>
                                <span className="analytics-dot dot-progress"></span>
                                <p>In Progress</p>
                                <strong>{inProgressTasks.length}</strong>
                            </div>

                        </div>

                    </div>
                </div>

                {/* WEEKLY CHART */}

                <div className="analytics-panel weekly-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Weekly Activity</h3>
                            <p>Tasks created this week</p>
                        </div>
                        <CalendarDays size={21} />
                    </div>

                    <div className="weekly-chart">
                        {weeklyData.map(item => (
                            <div
                                className="weekly-chart-column"
                                key={item.date}
                            >
                                <strong>{item.count}</strong>

                                <div className="weekly-bar-area">
                                    <div
                                        className="weekly-bar"
                                        style={{
                                            height: `${Math.max(
                                                item.count > 0 ? 8 : 0,
                                                (item.count / maxWeekly) * 100
                                            )}%`
                                        }}
                                    />
                                </div>

                                <span>{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* CATEGORY AND PRIORITY */}

            <div className="analytics-main-grid">

                <div className="analytics-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Category Distribution</h3>
                            <p>Tasks grouped by category</p>
                        </div>
                    </div>

                    <div className="distribution-list">
                        {categoryData.map(item => (
                            <div
                                className="distribution-item"
                                key={item.name}
                            >
                                <div className="distribution-label">
                                    <span>{item.name}</span>
                                    <strong>{item.count}</strong>
                                </div>

                                <div className="distribution-track">
                                    <div
                                        className="distribution-fill category-fill"
                                        style={{
                                            width: `${(item.count / maxCategory) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Priority Distribution</h3>
                            <p>Tasks grouped by priority</p>
                        </div>
                    </div>

                    <div className="distribution-list">
                        {priorityData.map(item => (
                            <div
                                className="distribution-item"
                                key={item.name}
                            >
                                <div className="distribution-label">
                                    <span>{item.name}</span>
                                    <strong>{item.count}</strong>
                                </div>

                                <div className="distribution-track">
                                    <div
                                        className={`distribution-fill priority-fill ${item.name.toLowerCase()}`}
                                        style={{
                                            width: `${(item.count / maxPriority) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* UPCOMING TASKS */}

            <div className="analytics-panel upcoming-panel">

                <div className="analytics-panel-heading">
                    <div>
                        <h3>Upcoming Deadlines</h3>
                        <p>Uncompleted tasks due within the next 7 days</p>
                    </div>

                    <span className="upcoming-count">
                        {upcomingTasks.length} Tasks
                    </span>
                </div>

                {upcomingTasks.length > 0 ? (
                    <div className="upcoming-list">
                        {[...upcomingTasks]
                            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                            .map(task => (
                                <div
                                    className="upcoming-task"
                                    key={task.id}
                                >
                                    <div>
                                        <h4>{task.title}</h4>
                                        <span>{task.category}</span>
                                    </div>

                                    <div className="upcoming-task-right">
                                        <span className="upcoming-priority">
                                            {task.priority}
                                        </span>

                                        <strong>
                                            {formatDate(task.dueDate)}
                                        </strong>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="analytics-empty">
                        <CheckCircle2 size={25} />
                        <p>No upcoming deadlines in the next seven days.</p>
                    </div>
                )}

            </div>

        </section>
    );
}

export default Analytics;
