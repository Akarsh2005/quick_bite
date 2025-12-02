import React from 'react';
import { useNavigate } from 'react-router-dom';
// import './home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-home">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <span className="navbar-brand">Admin Panel</span>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link"
                                    onClick={() => navigate('/admin/restaurants')}
                                >
                                    Restaurants
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link"
                                    onClick={() => navigate('/admin/foods')}
                                >
                                    Food Items
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link btn btn-link"
                                    onClick={() => navigate('/admin/orders')}
                                >
                                    Orders
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mt-5">
                <div className="row">
                    <div className="col-12 text-center">
                        <h1 className="display-4 mb-4">Welcome to Admin Panel</h1>
                        <p className="lead mb-5">Manage your restaurants, food items, and orders from one place</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="fas fa-utensils fa-3x text-primary"></i>
                                </div>
                                <h5 className="card-title">Restaurants</h5>
                                <p className="card-text">Manage restaurant information, add new restaurants, and update existing ones.</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/admin/restaurants')}
                                >
                                    Manage Restaurants
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="fas fa-hamburger fa-3x text-success"></i>
                                </div>
                                <h5 className="card-title">Food Items</h5>
                                <p className="card-text">Add new food items, update menus, and manage food categories.</p>
                                <button 
                                    className="btn btn-success"
                                    onClick={() => navigate('/admin/foods')}
                                >
                                    Manage Food Items
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="fas fa-clipboard-list fa-3x text-warning"></i>
                                </div>
                                <h5 className="card-title">Orders</h5>
                                <p className="card-text">View all orders, update order status, and track order progress.</p>
                                <button 
                                    className="btn btn-warning"
                                    onClick={() => navigate('/admin/orders')}
                                >
                                    Manage Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;