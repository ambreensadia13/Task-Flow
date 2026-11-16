
import React, { useEffect, useState } from "react";
import { X, CalendarDays, Plus } from "lucide-react";

const emptyTask = {
    title: "",
    description: "",
    category: "Personal",
    priority: "Medium",
    status: "Pending",
    dueDate: ""
};

function TaskModal({ isOpen, onClose, onSave, editingTask }) {
    const [form, setForm] = useState(emptyTask);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setForm(editingTask ? {
                ...emptyTask,
                ...editingTask
            } : emptyTask);

            setError("");
        }
    }, [isOpen, editingTask]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        onSave({
            ...form,
            title: form.title.trim(),
            description: form.description.trim()
        });
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div
                className="task-modal"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <span className="modal-eyebrow">
                            TASK MANAGEMENT
                        </span>

                        <h2>
                            {editingTask ? "Edit Task" : "Create New Task"}
                        </h2>

                        <p>Organize your work and stay productive.</p>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Task Title *</label>

                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Complete React project"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe what needs to be done..."
                            rows="4"
                            maxLength={1000}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option>Personal</option>
                                <option>Study</option>
                                <option>Work</option>
                                <option>Development</option>
                                <option>Projects</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>

                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <CalendarDays size={14} />
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="form-error">{error}</p>
                    )}

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="save-button">
                            <Plus size={17} />
                            {editingTask ? "Update Task" : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
