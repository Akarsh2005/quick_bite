import React, { useState, useEffect } from 'react'; // Added useEffect import
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './placeorder.css';

const PlaceOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items, totalAmount, deliveryCharge, grandTotal } = location.state || {};
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!items || items.length === 0) {
            toast.error('No items in cart');
            navigate('/cart');
        }
    }, [items, navigate]);

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    const handlePlaceOrder = async () => {
        if (!address.street || !address.city || !address.state || !address.pincode) {
            toast.error('Please fill all address fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                userId: user?._id,
                items: items.map(item => ({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    restaurantId: item.restaurantId?._id
                })),
                amount: grandTotal,
                address: address
            };

            let response;
            if (paymentMethod === 'cod') {
                response = await axios.post('http://localhost:5001/api/orders/placecod', 
                    orderData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axios.post('http://localhost:5001/api/orders/place', 
                    orderData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (response.data.success) {
                if (paymentMethod === 'stripe') {
                    // Redirect to Stripe checkout
                    window.location.href = response.data.session_url;
                } else {
                    toast.success('Order placed successfully!');
                    navigate('/orders');
                }
            }
        } catch (error) {
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="placeorder-page">
            <nav className="navbar navbar-light bg-light">
                <div className="container">
                    <h4 className="mb-0">Place Order</h4>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Address Form */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Delivery Address</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Street Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="street"
                                                value={address.street}
                                                onChange={handleAddressChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="city"
                                                value={address.city}
                                                onChange={handleAddressChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">State</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="state"
                                                value={address.state}
                                                onChange={handleAddressChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Pincode</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="pincode"
                                                value={address.pincode}
                                                onChange={handleAddressChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="card">
                            <div className="card-header">
                                <h5>Payment Method</h5>
                            </div>
                            <div className="card-body">
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentMethod"
                                        value="stripe"
                                        checked={paymentMethod === 'stripe'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label">
                                        💳 Credit/Debit Card (Stripe)
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label">
                                        💰 Cash on Delivery
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Order Summary</h5>
                            </div>
                            <div className="card-body">
                                {items.map(item => (
                                    <div key={item._id} className="d-flex justify-content-between mb-2">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Delivery Charge:</span>
                                    <span>₹{deliveryCharge}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Grand Total:</strong>
                                    <strong>₹{grandTotal}</strong>
                                </div>
                                <button 
                                    className="btn btn-primary w-100"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                >
                                    {loading ? 'Placing Order...' : `Place Order (${paymentMethod === 'stripe' ? 'Pay Now' : 'COD'})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;