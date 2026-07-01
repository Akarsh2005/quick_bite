import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import './cart.css';

const Cart = () => {
    const { cartItems, cartTotal, addToCart, removeFromCart } = useApp();
    const navigate = useNavigate();

    const deliveryCharge = cartTotal > 0 ? 50 : 0;
    const grandTotal = cartTotal + deliveryCharge;

    const handleProceedToPayment = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/placeorder', { 
            state: { 
                items: cartItems,
                totalAmount: cartTotal,
                deliveryCharge: deliveryCharge,
                grandTotal: grandTotal
            }
        });
    };

    return (
        <div className="cart-page">
            <Navbar />

            <div className="container mt-4">
                <h4 className="mb-4">Shopping Cart</h4>
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted">Your cart is empty</h4>
                        <p className="mb-4">Add some delicious food items to your cart!</p>
                        <Link to="/" className="btn btn-primary rounded-pill px-4">Browse Menu</Link>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Cart Items ({cartItems.length})</h5>
                                </div>
                                <div className="card-body">
                                    {cartItems.map(item => (
                                        <div key={item._id} className="cart-item row align-items-center mb-3 pb-3 border-bottom">
                                            <div className="col-md-6">
                                                <h6 className="mb-1">{item.name}</h6>
                                                <small className="text-muted d-block mb-1">{item.restaurantId?.name}</small>
                                                <div className="text-primary fw-semibold">₹{item.price}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm rounded-circle"
                                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                                        onClick={() => removeFromCart(item._id)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="mx-3 fw-bold">{item.quantity}</span>
                                                    <button 
                                                        className="btn btn-outline-success btn-sm rounded-circle"
                                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                                        onClick={() => addToCart(item._id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <strong className="text-dark">₹{item.price * item.quantity}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Order Summary</h5>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal:</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Delivery Charge:</span>
                                        <span>₹{deliveryCharge}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <strong>Grand Total:</strong>
                                        <strong className="text-primary h5 mb-0">₹{grandTotal}</strong>
                                    </div>
                                    <button 
                                        className="btn btn-primary w-100 rounded-pill py-2 fw-semibold"
                                        onClick={handleProceedToPayment}
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;