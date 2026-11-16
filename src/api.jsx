
const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/tasks";

async function request(endpoint = "", options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// Fetch all tasks
export async function fetchTasks() {
    const data = await request();
    return data.tasks;
}

// Create task
export async function createTask(taskData) {
    const data = await request("", {
        method: "POST",
        body: JSON.stringify(taskData),
    });

    return data.task;
}

// Update task
export async function updateTask(id, taskData) {
    const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
    });

    return data.task;
}

// Delete task
export async function deleteTask(id) {
    return request(`/${id}`, {
        method: "DELETE",
    });
}
