import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/orders/userorders', 
                { userId: user?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Food Processing':
                return 'bg-warning';
            case 'Out for delivery':
                return 'bg-info';
            case 'Delivered':
                return 'bg-success';
            case 'Cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <nav className="navbar navbar-light bg-light">
                <div className="container">
                    <Link to="/" className="navbar-brand">Food Delivery</Link>
                    <h4 className="mb-0">My Orders</h4>
                </div>
            </nav>

            <div className="container mt-4">
                {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No orders found</h4>
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/" className="btn btn-primary">Browse Food Items</Link>
                    </div>
                ) : (
                    <div className="row">
                        {orders.map(order => (
                            <div key={order._id} className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Order ID: {order._id.slice(-8)}</strong>
                                            <small className="text-muted ms-3">{formatDate(order.date)}</small>
                                        </div>
                                        <div>
                                            <span className={`badge ${getStatusBadgeClass(order.status)} me-2`}>
                                                {order.status}
                                            </span>
                                            <span className={`badge ${order.payment ? 'bg-success' : 'bg-danger'}`}>
                                                {order.payment ? 'Paid' : 'Payment Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>Items:</h6>
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="d-flex justify-content-between mb-1">
                                                        <span>{item.name} (x{item.quantity})</span>
                                                        <span>₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Delivery Address:</h6>
                                                <p className="mb-1">{order.address.street}</p>
                                                <p className="mb-1">{order.address.city}, {order.address.state}</p>
                                                <p className="mb-0">Pincode: {order.address.pincode}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <strong>Total Amount:</strong>
                                            <strong>₹{order.amount}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;