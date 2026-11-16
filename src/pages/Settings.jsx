
import React from "react";
import { Moon, Sun, Palette, CheckCircle2 } from "lucide-react";

function Settings({ settings, onSettingsChange }) {
    const isDark = settings.theme === "dark";

    const handleThemeChange = (checked) => {
        onSettingsChange({
            ...settings,
            theme: checked ? "dark" : "light"
        });
    };

    return (
        <section className="settings-page">
            <div className="settings-intro">
                <div>
                    <h2>Settings</h2>
                    <p>Customize your TaskFlow workspace and preferences.</p>
                </div>
            </div>

            <div className="settings-section-card">
                <div className="settings-card-heading">
                    <div className="settings-heading-icon">
                        <Palette size={21} />
                    </div>
                    <div>
                        <h3>Appearance</h3>
                        <p>Personalize how TaskFlow looks on your device.</p>
                    </div>
                </div>

                <div className="settings-option">
                    <div className="settings-option-info">
                        <div className="settings-option-title">
                            {isDark ? <Moon size={19} /> : <Sun size={19} />}
                            <strong>Dark Mode</strong>
                        </div>

                        <p>
                            {isDark
                                ? "Dark appearance is currently enabled."
                                : "Use a darker appearance for your workspace."}
                        </p>
                    </div>

                    <label className="settings-switch">
                        <input
                            type="checkbox"
                            checked={isDark}
                            onChange={(e) => handleThemeChange(e.target.checked)}
                            aria-label="Enable dark mode"
                        />
                        <span className="settings-switch-slider"></span>
                    </label>
                </div>

                <div className="settings-theme-preview">
                    <div className={`theme-preview-card ${!isDark ? "selected" : ""}`}>
                        <div className="theme-preview-light">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <div className="theme-preview-label">
                            <Sun size={16} />
                            Light
                            {!isDark && <CheckCircle2 size={15} />}
                        </div>
                    </div>

                    <div className={`theme-preview-card ${isDark ? "selected" : ""}`}>
                        <div className="theme-preview-dark">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <div className="theme-preview-label">
                            <Moon size={16} />
                            Dark
                            {isDark && <CheckCircle2 size={15} />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section-card settings-info-card">
                <div className="settings-card-heading">
                    <div className="settings-heading-icon">
                        <CheckCircle2 size={21} />
                    </div>
                    <div>
                        <h3>Preferences</h3>
                        <p>Your appearance preference is saved automatically.</p>
                    </div>
                </div>
                <div className="settings-saved-message">
                    <CheckCircle2 size={17} />
                    Settings are stored in this browser.
                </div>
            </div>
        </section>
    );
}

export default Settings;
