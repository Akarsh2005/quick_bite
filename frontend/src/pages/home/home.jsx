import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './home.css';

const Home = () => {
    const [foods, setFoods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchFoods();
        fetchCart();
    }, []);

    const fetchFoods = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/foods/list');
            if (response.data.success) {
                setFoods(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch food items');
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/cart/get', 
                { userId: user?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setCart(response.data.cartData || {});
            }
        } catch (error) {
            console.error('Failed to fetch cart');
        }
    };

    const addToCart = async (foodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/cart/add', 
                { userId: user?._id, itemId: foodId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(prev => ({
                ...prev,
                [foodId]: (prev[foodId] || 0) + 1
            }));
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    const removeFromCart = async (foodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/cart/remove', 
                { userId: user?._id, itemId: foodId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(prev => {
                const newCart = { ...prev };
                if (newCart[foodId] > 1) {
                    newCart[foodId] -= 1;
                } else {
                    delete newCart[foodId];
                }
                return newCart;
            });
            toast.info('Removed from cart!');
        } catch (error) {
            toast.error('Failed to remove from cart');
        }
    };

    const getCartCount = () => {
        return Object.values(cart).reduce((sum, count) => sum + count, 0);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.restaurantId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="home-page">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <span className="navbar-brand">Food Delivery</span>
                    
                    {/* Search Bar */}
                    <div className="mx-auto" style={{ width: '400px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search food items, categories, or restaurants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* User Info and Logout */}
                    <div className="navbar-nav ms-auto">
                        <div className="nav-item dropdown">
                            <button className="btn btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
                                👋 {user?.name}
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <button className="dropdown-item" onClick={() => navigate('/orders')}>
                                        My Orders
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
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mb-4">Available Food Items</h2>
                    </div>
                </div>

                <div className="row">
                    {filteredFoods.map(food => (
                        <div key={food._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card food-card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{food.name}</h5>
                                    <p className="card-text text-muted">{food.description}</p>
                                    <div className="mb-2">
                                        <small className="text-muted">Category: {food.category}</small>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted">Restaurant: {food.restaurantId?.name}</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="h5 text-primary mb-0">₹{food.price}</span>
                                        <div className="d-flex align-items-center">
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removeFromCart(food._id)}
                                                disabled={!cart[food._id]}
                                            >
                                                -
                                            </button>
                                            <span className="mx-2">{cart[food._id] || 0}</span>
                                            <button 
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => addToCart(food._id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFoods.length === 0 && (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No food items found</h4>
                        <p>Try adjusting your search terms</p>
                    </div>
                )}
            </div>

            {/* Cart Button */}
            {getCartCount() > 0 && (
                <div className="cart-floating-btn">
                    <button 
                        className="btn btn-warning btn-lg rounded-pill shadow"
                        onClick={() => navigate('/cart')}
                    >
                        🛒 Cart ({getCartCount()})
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;