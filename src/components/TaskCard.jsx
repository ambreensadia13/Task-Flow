
import React from "react";
import {
    CalendarDays,
    Pencil,
    Trash2,
    CheckCircle2,
    Circle
} from "lucide-react";

function TaskCard({ task, onEdit, onDelete, onToggle }) {
    const isCompleted = task.status === "Completed";

    const formattedDate = task.dueDate
        ? new Date(task.dueDate + "T00:00:00").toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
        )
        : "No deadline";

    return (
        <article className={`task-card ${isCompleted ? "task-done" : ""}`}>
            <div className="task-card-top">
                <button
                    className="complete-button"
                    onClick={() => onToggle(task)}
                    aria-label="Toggle task completion"
                    title="Toggle completion"
                >
                    {isCompleted
                        ? <CheckCircle2 size={21} />
                        : <Circle size={21} />
                    }
                </button>

                <div className="task-card-content">
                    <h3>{task.title}</h3>

                    <p>
                        {task.description || "No description provided."}
                    </p>
                </div>
            </div>

            <div className="task-card-meta">
                <span className="category-label">
                    {task.category}
                </span>

                <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>

                <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                    {task.status}
                </span>
            </div>

            <div className="task-card-footer">
                <span className="task-date">
                    <CalendarDays size={14} />
                    {formattedDate}
                </span>

                <div className="task-actions">
                    <button
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onDelete(task.id)}
                        title="Delete task"
                        aria-label="Delete task"
                        className="delete-action"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default TaskCard;
