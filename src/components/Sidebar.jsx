
import React from "react";
import {
    LayoutDashboard,
    CheckSquare,
    CalendarDays,
    ChartNoAxesCombined,
    Settings,
    ListTodo,
    X
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Tasks", icon: CheckSquare },
    { name: "Calendar", icon: CalendarDays },
    { name: "Analytics", icon: ChartNoAxesCombined }
];

function Sidebar({
    activePage,
    setActivePage,
    open,
    setOpen,
    profile,
    onProfileClick
}) {
    const initials = profile?.name?.trim()
        ? profile.name.trim().split(/\s+/)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase()
        : "A";

    return (
        <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <ListTodo size={25} />
                </div>

                <div>
                    <h2>TaskFlow</h2>
                    <span>Manage your day</span>
                </div>

                <button
                    className="close-sidebar"
                    onClick={() => setOpen(false)}
                >
                    <X size={21} />
                </button>
            </div>

            <div className="sidebar-section">
                <p className="section-label">WORKSPACE</p>

                <nav>
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.name}
                                className={`nav-item ${activePage === item.name ? "active" : ""
                                    }`}
                                onClick={() => {
                                    setActivePage(item.name);
                                    setOpen(false);
                                }}
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <button
                    className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
                    onClick={() => {
                        setActivePage("Settings");
                        setOpen(false);
                    }}
                >
                    <Settings size={19} />
                    <span>Settings</span>
                </button>

                <button
                    type="button"
                    className="profile-card workspace-profile-trigger"
                    onClick={() => {
                        onProfileClick();
                        setOpen(false);
                    }}
                    aria-label="Edit workspace profile"
                >
                    <div className="avatar">
                        {profile?.picture ? (
                            <img src={profile.picture} alt="Profile" />
                        ) : (
                            initials
                        )}
                    </div>

                    <div className="profile-info">
                        <strong>{profile?.name || "My Workspace"}</strong>
                        <span>{profile?.role || "Personal Account"}</span>
                    </div>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
