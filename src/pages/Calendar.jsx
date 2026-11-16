
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Calendar as CalendarIcon,
    Clock3,
    CheckCircle2,
    Circle,
    AlertCircle,
    Plus,
    CalendarCheck,
    Pencil,
    Check,
} from "lucide-react";

import "./Calendar.css";

/* =========================================
   DATE HELPERS
========================================= */

const getDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? null
            : new Date(value);
    }

    if (typeof value === "number") {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (typeof value !== "string") return null;

    const trimmed = value.trim();

    if (!trimmed) return null;

    // Parse YYYY-MM-DD as a local date to avoid timezone shifts.
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    const parsed = new Date(trimmed);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTaskDate = (task) => {
    const fields = [
        "dueDate",
        "due_date",
        "deadline",
        "deadline_date",
        "scheduledDate",
        "scheduled_date",
        "task_date",
        "date",
    ];

    for (const field of fields) {
        const value = task?.[field];

        if (value === undefined || value === null || value === "") {
            continue;
        }

        const parsed = parseDate(value);

        if (parsed) return parsed;
    }

    return null;
};

const getTaskId = (task) => {
    return task?.id ?? task?._id ?? null;
};

const startOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();

    result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
    result.setHours(0, 0, 0, 0);

    return result;
};

const addDays = (date, amount) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);

    return result;
};

const addMonths = (date, amount) => {
    const targetMonth = new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1
    );

    const lastDay = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0
    ).getDate();

    return new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        Math.min(date.getDate(), lastDay)
    );
};

const isSameDay = (first, second) => {
    return getDateKey(first) === getDateKey(second);
};

const formatMonth = (date) =>
    date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

const formatLongDate = (date) =>
    date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const getPriority = (priority) => {
    const value = String(priority || "Medium").toLowerCase();

    return ["low", "medium", "high", "urgent"].includes(value)
        ? value
        : "medium";
};

const getTaskStatus = (task) => {
    return String(task?.status || "Pending")
        .trim()
        .toLowerCase();
};

const isTaskCompleted = (task) => {
    return getTaskStatus(task) === "completed";
};

const getStatusLabel = (status) => {
    const value = String(status || "Pending").trim();

    return value || "Pending";
};

/* =========================================
   CALENDAR COMPONENT
========================================= */

function Calendar({
    tasks = [],
    onAddTask,
    onEdit,
    onToggle,
}) {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [view, setView] = useState("month");

    const hasAutoSelected = useRef(false);

    const todayKey = getDateKey(new Date());

    /* =========================================
       PREPARE TASKS
    ========================================= */

    const validTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];

        return tasks
            .filter(
                (task) =>
                    task &&
                    typeof task === "object" &&
                    !Array.isArray(task)
            )
            .map((task) => ({
                ...task,
                calendarDate: getTaskDate(task),
            }))
            .filter((task) => task.calendarDate !== null);
    }, [tasks]);

    /* =========================================
       INITIAL DATE SELECTION
    ========================================= */

    useEffect(() => {
        if (hasAutoSelected.current || validTasks.length === 0) {
            return;
        }

        const sortedTasks = [...validTasks].sort(
            (a, b) =>
                a.calendarDate.getTime() - b.calendarDate.getTime()
        );

        const nextTask =
            sortedTasks.find(
                (task) => getDateKey(task.calendarDate) >= todayKey
            ) || sortedTasks[0];

        if (nextTask) {
            const taskDate = new Date(nextTask.calendarDate);

            setSelectedDate(taskDate);
            setCurrentDate(taskDate);

            hasAutoSelected.current = true;
        }
    }, [validTasks, todayKey]);

    /* =========================================
       GROUP TASKS BY DATE
    ========================================= */

    const tasksByDate = useMemo(() => {
        const grouped = {};

        validTasks.forEach((task) => {
            const key = getDateKey(task.calendarDate);

            if (!key) return;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(task);
        });

        Object.values(grouped).forEach((dateTasks) => {
            dateTasks.sort((a, b) =>
                String(a.title || "").localeCompare(
                    String(b.title || "")
                )
            );
        });

        return grouped;
    }, [validTasks]);

    const getTasksForDate = (date) => {
        return tasksByDate[getDateKey(date)] || [];
    };

    /* =========================================
       VISIBLE CALENDAR DATES
    ========================================= */

    const visibleDates = useMemo(() => {
        if (view === "day") {
            return [selectedDate];
        }

        if (view === "week") {
            const firstDay = startOfWeek(currentDate);

            return Array.from(
                { length: 7 },
                (_, index) => addDays(firstDay, index)
            );
        }

        const firstOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );

        const firstVisibleDay = startOfWeek(firstOfMonth);

        return Array.from(
            { length: 42 },
            (_, index) => addDays(firstVisibleDay, index)
        );
    }, [currentDate, selectedDate, view]);

    /* =========================================
       STATISTICS
    ========================================= */

    const selectedTasks = getTasksForDate(selectedDate);

    const completedCount = selectedTasks.filter(
        isTaskCompleted
    ).length;

    const pendingCount = selectedTasks.length - completedCount;

    const overdueCount = validTasks.filter((task) => {
        return (
            getDateKey(task.calendarDate) < todayKey &&
            !isTaskCompleted(task)
        );
    }).length;

    const upcomingCount = validTasks.filter((task) => {
        return (
            getDateKey(task.calendarDate) >= todayKey &&
            !isTaskCompleted(task)
        );
    }).length;

    /* =========================================
       NAVIGATION
    ========================================= */

    const changePeriod = (direction) => {
        const amount = direction === "next" ? 1 : -1;

        if (view === "month") {
            const nextDate = addMonths(currentDate, amount);

            setCurrentDate(nextDate);
            setSelectedDate(nextDate);
            return;
        }

        if (view === "week") {
            const nextDate = addDays(currentDate, amount * 7);

            setCurrentDate(nextDate);
            setSelectedDate(nextDate);
            return;
        }

        const nextDate = addDays(selectedDate, amount);

        setSelectedDate(nextDate);
        setCurrentDate(nextDate);
    };

    const goToToday = () => {
        const now = new Date();

        setCurrentDate(now);
        setSelectedDate(now);
    };

    const handleDateClick = (date) => {
        setSelectedDate(new Date(date));
        setCurrentDate(new Date(date));
    };

    const handleViewChange = (nextView) => {
        setView(nextView);
        setCurrentDate(selectedDate);
    };

    /* =========================================
       TASK ACTIONS
    ========================================= */

    const handleEditTask = (task, event) => {
        event?.stopPropagation();

        if (typeof onEdit === "function") {
            onEdit(task);
        }
    };

    const handleToggleTask = (task, event) => {
        event?.stopPropagation();

        const taskId = getTaskId(task);

        if (
            taskId !== null &&
            taskId !== undefined &&
            typeof onToggle === "function"
        ) {
            onToggle(taskId);
        }
    };

    const handleAddTask = () => {
        if (typeof onAddTask === "function") {
            onAddTask();
        }
    };

    /* =========================================
       HEADINGS
    ========================================= */

    const getHeading = () => {
        if (view === "day") {
            return formatLongDate(selectedDate);
        }

        if (view === "week") {
            const first = startOfWeek(currentDate);
            const last = addDays(first, 6);

            const firstLabel = first.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });

            const lastLabel = last.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });

            return `${firstLabel} – ${lastLabel}`;
        }

        return formatMonth(currentDate);
    };

    /* =========================================
       STATUS ICON
    ========================================= */

    const getTaskStatusIcon = (task) => {
        const status = getTaskStatus(task);

        if (status === "completed") {
            return <CheckCircle2 size={14} />;
        }

        if (status === "in progress") {
            return <Clock3 size={14} />;
        }

        return <Circle size={14} />;
    };

    /* =========================================
       CALENDAR TASK
    ========================================= */

    const renderTask = (task, compact = false) => {
        const taskId = getTaskId(task);
        const priority = getPriority(task.priority);
        const title = task.title || "Untitled task";

        const key =
            taskId ??
            `${title}-${getDateKey(task.calendarDate)}`;

        return (
            <div
                key={key}
                className={`calendar-task ${priority}`}
                title={`${title} • ${priority} priority`}
                role={typeof onEdit === "function" ? "button" : undefined}
                tabIndex={typeof onEdit === "function" ? 0 : undefined}
                onClick={(event) => handleEditTask(task, event)}
                onKeyDown={(event) => {
                    if (
                        typeof onEdit === "function" &&
                        (event.key === "Enter" || event.key === " ")
                    ) {
                        event.preventDefault();
                        handleEditTask(task, event);
                    }
                }}
            >
                <span className="calendar-task-icon">
                    {getTaskStatusIcon(task)}
                </span>

                <span className="calendar-task-title">
                    {title}
                </span>

                {!compact && (
                    <span className="calendar-task-priority">
                        {task.priority || "Medium"}
                    </span>
                )}
            </div>
        );
    };

    /* =========================================
       CALENDAR CELL
    ========================================= */

    const renderCalendarCell = (date) => {
        const dateKey = getDateKey(date);
        const dateTasks = getTasksForDate(date);

        const isToday = dateKey === todayKey;
        const isSelected = isSameDay(date, selectedDate);

        const isCurrentMonth =
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();

        const visibleTaskLimit = view === "month" ? 3 : 6;

        return (
            <div
                key={dateKey}
                className={[
                    "calendar-cell",
                    !isCurrentMonth && view === "month"
                        ? "outside-month"
                        : "",
                    isToday ? "today-cell" : "",
                    isSelected ? "selected-cell" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={() => handleDateClick(date)}
            >
                <div className="calendar-cell-top">
                    <button
                        type="button"
                        className={`calendar-date-number ${isToday ? "today-number" : ""
                            }`}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleDateClick(date);
                        }}
                        aria-label={`Select ${formatLongDate(date)}`}
                    >
                        {date.getDate()}
                    </button>

                    {dateTasks.length > 0 && (
                        <span className="calendar-task-count">
                            {dateTasks.length}
                        </span>
                    )}
                </div>

                <div className="calendar-cell-tasks">
                    {dateTasks
                        .slice(0, visibleTaskLimit)
                        .map((task) => renderTask(task, true))}

                    {dateTasks.length > visibleTaskLimit && (
                        <span className="calendar-more">
                            +{dateTasks.length - visibleTaskLimit} more
                        </span>
                    )}
                </div>
            </div>
        );
    };

    /* =========================================
       MAIN RENDER
    ========================================= */

    return (
        <div className="advanced-calendar">

            {/* PAGE HEADER */}
            <div className="calendar-header">
                <div>
                    <div className="calendar-eyebrow">
                        <CalendarDays size={16} />
                        TASK MANAGEMENT
                    </div>

                    <h1>My Calendar</h1>

                    <p>
                        Organize your schedule and stay on top of your tasks.
                    </p>
                </div>

                <button
                    type="button"
                    className="calendar-add-button"
                    onClick={handleAddTask}
                    disabled={typeof onAddTask !== "function"}
                    title="Create a new task"
                >
                    <Plus size={18} />
                    Add New Task
                </button>
            </div>

            {/* STATISTICS */}
            <div className="calendar-statistics">
                <div className="calendar-stat-card">
                    <div className="calendar-stat-icon mint-icon">
                        <CalendarCheck size={20} />
                    </div>

                    <div>
                        <span>Total Scheduled</span>
                        <strong>{validTasks.length}</strong>
                    </div>
                </div>

                <div className="calendar-stat-card">
                    <div className="calendar-stat-icon rose-icon">
                        <AlertCircle size={20} />
                    </div>

                    <div>
                        <span>Overdue</span>
                        <strong>{overdueCount}</strong>
                    </div>
                </div>

                <div className="calendar-stat-card">
                    <div className="calendar-stat-icon teal-icon">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Upcoming</span>
                        <strong>{upcomingCount}</strong>
                    </div>
                </div>
            </div>

            {/* CALENDAR CONTENT */}
            <div className="calendar-layout">

                <section className="calendar-main-panel">

                    {/* TOOLBAR */}
                    <div className="calendar-toolbar">
                        <div className="calendar-period">
                            <h2>{getHeading()}</h2>

                            <div className="calendar-navigation">
                                <button
                                    type="button"
                                    onClick={() => changePeriod("previous")}
                                    aria-label="Previous period"
                                >
                                    <ChevronLeft size={19} />
                                </button>

                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="calendar-today-button"
                                >
                                    Today
                                </button>

                                <button
                                    type="button"
                                    onClick={() => changePeriod("next")}
                                    aria-label="Next period"
                                >
                                    <ChevronRight size={19} />
                                </button>
                            </div>
                        </div>

                        <div className="calendar-view-switch">
                            {["month", "week", "day"].map((item) => (
                                <button
                                    type="button"
                                    key={item}
                                    className={view === item ? "active" : ""}
                                    onClick={() => handleViewChange(item)}
                                    aria-pressed={view === item}
                                >
                                    {item.charAt(0).toUpperCase() +
                                        item.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CALENDAR GRID */}
                    <div className="calendar-grid">
                        <div className="calendar-weekdays">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                (day) => (
                                    <div key={day}>{day}</div>
                                )
                            )}
                        </div>

                        <div className={`calendar-days-grid ${view}-view`}>
                            {visibleDates.map(renderCalendarCell)}
                        </div>
                    </div>

                    {/* LEGEND */}
                    <div className="calendar-legend">
                        <span>
                            <i className="legend-dot high"></i>
                            High / Urgent
                        </span>

                        <span>
                            <i className="legend-dot medium"></i>
                            Medium
                        </span>

                        <span>
                            <i className="legend-dot low"></i>
                            Low
                        </span>

                        <span>
                            <i className="legend-dot completed"></i>
                            Completed
                        </span>
                    </div>

                </section>

                {/* SELECTED DATE PANEL */}
                <aside className="calendar-details-panel">

                    <div className="selected-date-heading">
                        <div className="selected-date-icon">
                            <CalendarIcon size={21} />
                        </div>

                        <div>
                            <span>SELECTED DATE</span>

                            <h3>
                                {selectedDate.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                })}
                            </h3>

                            <p>
                                {selectedDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* SELECTED DATE COUNTS */}
                    <div className="selected-task-summary">
                        <div>
                            <strong>{selectedTasks.length}</strong>
                            <span>Total</span>
                        </div>

                        <div>
                            <strong>{completedCount}</strong>
                            <span>Completed</span>
                        </div>

                        <div>
                            <strong>{pendingCount}</strong>
                            <span>Remaining</span>
                        </div>
                    </div>

                    {/* SELECTED DATE TASKS */}
                    <div className="selected-tasks-heading">
                        <h3>Scheduled Tasks</h3>
                        <span>{selectedTasks.length} tasks</span>
                    </div>

                    <div className="selected-tasks-list">
                        {selectedTasks.length > 0 ? (
                            selectedTasks.map((task) => {
                                const taskId = getTaskId(task);
                                const priority = getPriority(task.priority);
                                const status = getTaskStatus(task);

                                return (
                                    <div
                                        className="selected-task-card"
                                        key={
                                            taskId ??
                                            `${task.title}-${getDateKey(
                                                task.calendarDate
                                            )}`
                                        }
                                    >
                                        <div
                                            className={`task-status-indicator ${priority}`}
                                        />

                                        <div
                                            className="selected-task-content"
                                            onClick={(event) =>
                                                handleEditTask(task, event)
                                            }
                                            role={
                                                typeof onEdit === "function"
                                                    ? "button"
                                                    : undefined
                                            }
                                            tabIndex={
                                                typeof onEdit === "function"
                                                    ? 0
                                                    : undefined
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    typeof onEdit === "function" &&
                                                    (event.key === "Enter" ||
                                                        event.key === " ")
                                                ) {
                                                    event.preventDefault();
                                                    handleEditTask(task, event);
                                                }
                                            }}
                                        >
                                            <h4>
                                                {task.title || "Untitled task"}
                                            </h4>

                                            <p>
                                                {task.category || "General"} ·{" "}
                                                {task.priority || "Medium"} priority
                                            </p>

                                            <span
                                                className={`task-status-label ${status.replace(/\s+/g, "-")
                                                    }`}
                                            >
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>

                                        <div className="selected-task-actions">
                                            {typeof onToggle === "function" &&
                                                taskId !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) =>
                                                            handleToggleTask(
                                                                task,
                                                                event
                                                            )
                                                        }
                                                        title={
                                                            isTaskCompleted(task)
                                                                ? "Mark as pending"
                                                                : "Mark as completed"
                                                        }
                                                        aria-label={
                                                            isTaskCompleted(task)
                                                                ? "Mark as pending"
                                                                : "Mark as completed"
                                                        }
                                                    >
                                                        {isTaskCompleted(task) ? (
                                                            <Check size={15} />
                                                        ) : (
                                                            <CheckCircle2 size={15} />
                                                        )}
                                                    </button>
                                                )}

                                            {typeof onEdit === "function" && (
                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        handleEditTask(task, event)
                                                    }
                                                    title="Edit task"
                                                    aria-label="Edit task"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="calendar-empty-state">
                                <div>
                                    <CalendarDays size={27} />
                                </div>

                                <h4>No tasks scheduled</h4>

                                <p>
                                    There are no tasks assigned to this date.
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="calendar-add-date-button"
                        onClick={handleAddTask}
                        disabled={typeof onAddTask !== "function"}
                    >
                        <Plus size={17} />
                        Add task
                    </button>

                </aside>
            </div>
        </div>
    );
}

export default Calendar;
