import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Navbar from '../../components/Navbar/Navbar';
import { useApp } from '../../context/AppContext';
import './profile.css';

const Profile = () => {
    const { user, login } = useApp();
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await API.put('/api/users/profile', {
                name,
                currentPassword: newPassword ? currentPassword : undefined,
                newPassword: newPassword || undefined
            });

            if (response.data.success) {
                toast.success('Profile updated successfully!');
                login(response.data.user, localStorage.getItem('token'));
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <Navbar />
            <div className="container mt-5" style={{ maxWidth: '600px' }}>
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h4 className="mb-0 fw-bold">User Profile</h4>
                    </div>
                    <div className="card-body py-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control bg-light"
                                    value={user?.email || ''}
                                    disabled
                                />
                                <div className="form-text">Your email address cannot be changed.</div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <hr className="my-4" />
                            <h5 className="mb-3 fw-bold">Change Password</h5>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Leave these fields blank if you do not want to change your password.
                            </p>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 rounded-pill py-2 fw-semibold"
                                disabled={loading}
                            >
                                {loading ? 'Saving Updates...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
