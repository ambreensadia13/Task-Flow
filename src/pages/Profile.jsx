
import React, { useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    BriefcaseBusiness,
    FileText,
    Pencil,
    Save,
    X,
    Camera
} from "lucide-react";

function Profile({ isOpen, onClose, profile, onSave }) {
    const [form, setForm] = useState(profile);

    useEffect(() => {
        setForm(profile);
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Please select an image smaller than 2 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm(prev => ({
                ...prev,
                picture: reader.result
            }));
        };

        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            ...form,
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role.trim(),
            bio: form.bio.trim()
        });
    };

    const initials = form.name?.trim()
        ? form.name.trim().split(/\s+/)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase()
        : "U";

    return (
        <div className="workspace-modal-overlay" onClick={onClose}>
            <section
                className="workspace-profile-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="workspace-modal-header">
                    <div>
                        <h2>Edit Workspace Profile</h2>
                        <p>Manage your personal workspace information.</p>
                    </div>

                    <button
                        type="button"
                        className="workspace-close-button"
                        onClick={onClose}
                        aria-label="Close profile"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="workspace-avatar-section">
                        <div className="workspace-avatar-preview">
                            {form.picture ? (
                                <img src={form.picture} alt="Profile" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>

                        <div className="workspace-picture-actions">
                            <label
                                htmlFor="workspace-picture"
                                className="workspace-upload-button"
                            >
                                <Camera size={16} />
                                Change Picture
                            </label>

                            <input
                                id="workspace-picture"
                                type="file"
                                accept="image/*"
                                onChange={handlePictureChange}
                                hidden
                            />

                            <span>JPG, PNG or other image formats. Max 2 MB.</span>
                        </div>
                    </div>

                    <div className="workspace-profile-fields">
                        <div className="profile-field">
                            <label htmlFor="workspace-name">Full Name</label>
                            <div className="profile-input-wrapper">
                                <UserRound size={18} />
                                <input
                                    id="workspace-name"
                                    name="name"
                                    value={form.name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    maxLength={80}
                                    required
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="workspace-email">Email Address</label>
                            <div className="profile-input-wrapper">
                                <Mail size={18} />
                                <input
                                    id="workspace-email"
                                    name="email"
                                    type="email"
                                    value={form.email || ""}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    maxLength={120}
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="workspace-role">Role / Occupation</label>
                            <div className="profile-input-wrapper">
                                <BriefcaseBusiness size={18} />
                                <input
                                    id="workspace-role"
                                    name="role"
                                    value={form.role || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Student, Developer"
                                    maxLength={80}
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="workspace-bio">About Me</label>
                            <div className="profile-textarea-wrapper">
                                <FileText size={18} />
                                <textarea
                                    id="workspace-bio"
                                    name="bio"
                                    value={form.bio || ""}
                                    onChange={handleChange}
                                    placeholder="Write something about yourself..."
                                    rows={4}
                                    maxLength={500}
                                />
                            </div>

                            <span className="profile-character-count">
                                {(form.bio || "").length}/500 characters
                            </span>
                        </div>
                    </div>

                    <div className="workspace-modal-actions">
                        <button
                            type="button"
                            className="profile-cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="profile-save-button"
                        >
                            <Save size={17} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Profile;
