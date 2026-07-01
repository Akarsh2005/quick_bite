import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import './home.css';

const Home = () => {
    const { foods, cart, addToCart, removeFromCart, cartCount } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    const categories = ['All', ...new Set(foods.map(food => food.category))];

    // Filter foods by both search term and category
    const filteredFoods = foods.filter(food => {
        const matchesSearch = 
            food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.restaurantId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="home-page">
            <Navbar showSearch={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="container mt-4">
                {/* Horizontal Category Filters */}
                <div className="mb-4">
                    <h5 className="mb-3">Filter by Category</h5>
                    <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`btn rounded-pill px-4 text-nowrap ${
                                    selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="row align-items-center mb-4">
                    <div className="col-12">
                        <h4 className="mb-0">
                            {selectedCategory === 'All' ? 'All Menu Items' : `${selectedCategory} Specials`}
                        </h4>
                        <small className="text-muted">Found {filteredFoods.length} items</small>
                    </div>
                </div>

                <div className="row">
                    {filteredFoods.map(food => (
                        <div key={food._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card food-card h-100 border-0 shadow-sm">
                                {food.image && (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${food.image}`} 
                                        alt={food.name} 
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: 'calc(0.375rem - 1px)', borderTopRightRadius: 'calc(0.375rem - 1px)' }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0">{food.name}</h5>
                                        <span className="badge bg-light text-secondary rounded-pill border">{food.category}</span>
                                    </div>
                                    <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>{food.description}</p>
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-2">🏪 {food.restaurantId?.name}</small>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="h5 text-primary mb-0 fw-bold">₹{food.price}</span>
                                            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 border">
                                                <button 
                                                    className="btn btn-sm btn-link text-decoration-none text-danger fw-bold p-0 px-2"
                                                    onClick={() => removeFromCart(food._id)}
                                                    disabled={!cart[food._id]}
                                                >
                                                    -
                                                </button>
                                                <span className="mx-2 fw-semibold" style={{ minWidth: '15px', textAlign: 'center' }}>
                                                    {cart[food._id] || 0}
                                                </span>
                                                <button 
                                                    className="btn btn-sm btn-link text-decoration-none text-success fw-bold p-0 px-2"
                                                    onClick={() => addToCart(food._id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFoods.length === 0 && (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No items match your filters</h4>
                        <p className="text-muted mb-0">Try clearing search filters or choosing another category</p>
                    </div>
                )}
            </div>

            {/* Cart Floating Button */}
            {cartCount > 0 && (
                <div className="cart-floating-btn position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1000 }}>
                    <button 
                        className="btn btn-warning btn-lg rounded-pill shadow-lg px-4 py-3 fw-bold"
                        onClick={() => navigate('/cart')}
                    >
                        🛒 View Cart ({cartCount})
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;