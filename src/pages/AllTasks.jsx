
import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ListTodo } from "lucide-react";
import TaskCard from "../components/TaskCard";

function AllTasks({
    tasks,
    onEdit,
    onDelete,
    onToggle,
    searchQuery,
    onSearchChange
}) {
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const searchText = searchQuery.trim().toLowerCase();

            const matchesSearch =
                (task.title || "").toLowerCase().includes(searchText) ||
                (task.description || "").toLowerCase().includes(searchText) ||
                (task.category || "").toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" || task.priority === priorityFilter;

            const matchesCategory =
                categoryFilter === "All" || task.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory
            );
        });
    }, [
        tasks,
        searchQuery,
        statusFilter,
        priorityFilter,
        categoryFilter
    ]);

    return (
        <section className="all-tasks-page">
            <div className="tasks-intro">
                <div>
                    <h2>Manage Your Tasks</h2>
                    <p>Everything you need to accomplish, in one place.</p>
                </div>

                <span className="task-count">
                    {filteredTasks.length} Tasks Found
                </span>
            </div>

            <div className="filter-panel">
                <div className="task-search">
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search title, description or category..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="filter-control">
                    <SlidersHorizontal size={17} />

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div className="filter-control">
                    <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                    >
                        <option value="All">All Priorities</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="filter-control">
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Personal">Personal</option>
                        <option value="Study">Study</option>
                        <option value="Work">Work</option>
                        <option value="Development">Development</option>
                        <option value="Projects">Projects</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {filteredTasks.length > 0 ? (
                <div className="task-cards-grid">
                    {filteredTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-tasks">
                    <div className="empty-icon">
                        <ListTodo size={35} />
                    </div>

                    <h3>No tasks found</h3>

                    <p>
                        {tasks.length === 0
                            ? "Create your first task to get started!"
                            : "Try changing your search or filters."
                        }
                    </p>
                </div>
            )}
        </section>
    );
}

export default AllTasks;
