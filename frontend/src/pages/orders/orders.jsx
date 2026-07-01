import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Navbar from '../../components/Navbar/Navbar';
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
            const response = await API.post('/api/orders/userorders', { userId: user?._id || user?.id });
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
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
            <Navbar />

            <div className="container mt-4">
                <h4 className="mb-4">My Orders</h4>
                {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No orders found</h4>
                        <p className="mb-4">You haven't placed any orders yet.</p>
                        <Link to="/" className="btn btn-primary rounded-pill px-4">Browse Menu</Link>
                    </div>
                ) : (
                    <div className="row">
                        {orders.map(order => (
                            <div key={order._id} className="col-12 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Order ID: {order._id.slice(-8)}</strong>
                                            <small className="text-muted ms-3">{formatDate(order.date)}</small>
                                        </div>
                                        <div>
                                            <span className={`badge ${getStatusBadgeClass(order.status)} me-2 rounded-pill px-3`}>
                                                {order.status}
                                            </span>
                                            <span className={`badge ${order.payment ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                                                {order.payment ? 'Paid' : 'Payment Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6 className="fw-semibold text-muted mb-2">Items:</h6>
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="d-flex justify-content-between mb-1">
                                                        <span>{item.name} (x{item.quantity})</span>
                                                        <span className="text-dark">₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="fw-semibold text-muted mb-2">Delivery Address:</h6>
                                                <p className="mb-1 text-dark">{order.address?.street}</p>
                                                <p className="mb-1 text-dark">{order.address?.city}, {order.address?.state}</p>
                                                <p className="mb-0 text-muted">Pincode: {order.address?.pincode}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted">Total Amount:</span>
                                            <strong className="text-primary h5 mb-0">₹{order.amount}</strong>
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