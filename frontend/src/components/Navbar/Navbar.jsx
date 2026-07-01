import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = ({ showSearch = false, searchTerm = '', setSearchTerm = () => {} }) => {
    const { user, logout, cartCount } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
                    <span>🍔</span> Quick Bite
                </Link>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    {showSearch && (
                        <div className="mx-auto my-2 my-lg-0" style={{ maxWidth: '450px', width: '100%' }}>
                            <input
                                type="text"
                                className="form-control rounded-pill px-3"
                                placeholder="Search food, category, or restaurant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    
                    <div className="navbar-nav ms-auto align-items-center gap-3">
                        <Link className="nav-link position-relative" to="/cart">
                            <span style={{ fontSize: '1.2rem' }}>🛒</span>
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="nav-item dropdown">
                                <button className="btn btn-outline-light rounded-pill dropdown-toggle px-3" data-bs-toggle="dropdown">
                                    👋 {user.name}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/orders')}>
                                            📦 My Orders
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link className="btn btn-outline-light rounded-pill px-4" to="/login">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
