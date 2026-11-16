
import React from "react";

function StatCard({ title, value, subtitle, icon: Icon, color }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>
                <Icon size={23} />
            </div>

            <p className="stat-title">{title}</p>

            <h2>{value}</h2>

            <span className="stat-subtitle">{subtitle}</span>
        </div>
    );
}

export default StatCard;
