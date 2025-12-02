import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchCartDetails();
    }, []);

    const fetchCartDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            // Get cart data
            const cartResponse = await axios.post('http://localhost:5001/api/cart/get', 
                { userId: user?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (cartResponse.data.success) {
                const cartData = cartResponse.data.cartData || {};
                const foodIds = Object.keys(cartData);

                if (foodIds.length === 0) {
                    setCartItems([]);
                    setLoading(false);
                    return;
                }

                // Get food details
                const foodsResponse = await axios.get('http://localhost:5001/api/foods/list');
                if (foodsResponse.data.success) {
                    const foods = foodsResponse.data.data;
                    const items = foodIds.map(foodId => {
                        const food = foods.find(f => f._id === foodId);
                        return {
                            ...food,
                            quantity: cartData[foodId],
                            total: food ? food.price * cartData[foodId] : 0
                        };
                    }).filter(item => item.name); // Remove items not found

                    setCartItems(items);
                }
            }
        } catch (error) {
            toast.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (foodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/cart/add', 
                { userId: user?._id, itemId: foodId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCartDetails();
        } catch (error) {
            toast.error('Failed to update cart');
        }
    };

    const removeFromCart = async (foodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/cart/remove', 
                { userId: user?._id, itemId: foodId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCartDetails();
        } catch (error) {
            toast.error('Failed to update cart');
        }
    };

    const getTotalAmount = () => {
        return cartItems.reduce((total, item) => total + item.total, 0);
    };

    const getDeliveryCharge = () => {
        return getTotalAmount() > 0 ? 50 : 0;
    };

    const getGrandTotal = () => {
        return getTotalAmount() + getDeliveryCharge();
    };

    const handleProceedToPayment = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/placeorder', { 
            state: { 
                items: cartItems,
                totalAmount: getTotalAmount(),
                deliveryCharge: getDeliveryCharge(),
                grandTotal: getGrandTotal()
            }
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
        <div className="cart-page">
            <nav className="navbar navbar-light bg-light">
                <div className="container">
                    <Link to="/" className="navbar-brand">Food Delivery</Link>
                    <h4 className="mb-0">Shopping Cart</h4>
                </div>
            </nav>

            <div className="container mt-4">
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted">Your cart is empty</h4>
                        <p>Add some delicious food items to your cart!</p>
                        <Link to="/" className="btn btn-primary">Browse Food Items</Link>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Cart Items ({cartItems.length})</h5>
                                </div>
                                <div className="card-body">
                                    {cartItems.map(item => (
                                        <div key={item._id} className="cart-item row align-items-center mb-3 pb-3 border-bottom">
                                            <div className="col-md-6">
                                                <h6>{item.name}</h6>
                                                <small className="text-muted">{item.restaurantId?.name}</small>
                                                <div className="text-primary">₹{item.price}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeFromCart(item._id)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="mx-3">{item.quantity}</span>
                                                    <button 
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => addToCart(item._id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <strong>₹{item.total}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Order Summary</h5>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>₹{getTotalAmount()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Delivery Charge:</span>
                                        <span>₹{getDeliveryCharge()}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-3">
                                        <strong>Grand Total:</strong>
                                        <strong>₹{getGrandTotal()}</strong>
                                    </div>
                                    <button 
                                        className="btn btn-primary w-100"
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