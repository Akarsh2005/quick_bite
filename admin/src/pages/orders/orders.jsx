import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/orders/list');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error(`Failed to fetch orders: ${error.message}`);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.post('http://localhost:5001/api/orders/status', {
                orderId,
                status: newStatus
            });
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            toast.error(`Failed to update order status: ${error.message}`);
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

    return (
        <div className="orders-page">
            <nav className="navbar navbar-dark bg-dark">
                <div className="container">
                    <span className="navbar-brand">Orders Management</span>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="card">
                    <div className="card-header">
                        <h5>All Orders</h5>
                    </div>
                    <div className="card-body">
                        {orders.length === 0 ? (
                            <p className="text-center text-muted">No orders found</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Amount</th>
                                            <th>Address</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td>{order._id.slice(-6)}</td>
                                                <td>{formatDate(order.date)}</td>
                                                <td>
                                                    <small>
                                                        {order.items.map(item => (
                                                            <div key={item._id}>
                                                                {item.name} (x{item.quantity})
                                                            </div>
                                                        ))}
                                                    </small>
                                                </td>
                                                <td>₹{order.amount}</td>
                                                <td>
                                                    <small>
                                                        {order.address.street}, {order.address.city},<br />
                                                        {order.address.state} - {order.address.pincode}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${order.payment ? 'bg-success' : 'bg-danger'}`}>
                                                        {order.payment ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select 
                                                        className="form-select form-select-sm"
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    >
                                                        <option value="Food Processing">Food Processing</option>
                                                        <option value="Out for delivery">Out for delivery</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;