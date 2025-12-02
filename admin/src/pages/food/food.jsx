import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
// import './food.css';

const Food = () => {
    const [foods, setFoods] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        restaurantId: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchFoods();
        fetchRestaurants();
    }, []);

    const fetchFoods = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/foods/list');
            if (response.data.success) {
                setFoods(response.data.data);
            }
        } catch (error) {
            toast.error(`Failed to fetch food items: ${error.message}`);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/restaurants/list');
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (error) {
            toast.error(`Failed to fetch restaurants: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const foodData = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingId) {
                await axios.put(`http://localhost:5001/api/foods/${editingId}`, foodData);
                toast.success('Food item updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/foods/add', foodData);
                toast.success('Food item created successfully');
            }
            
            setFormData({ name: '', description: '', price: '', category: '', restaurantId: '' });
            setEditingId(null);
            setShowForm(false);
            fetchFoods();
        } catch (error) {
            toast.error(`Failed to save food item: ${error.message}`);
        }
    };

    const handleEdit = (food) => {
        setFormData({
            name: food.name,
            description: food.description,
            price: food.price.toString(),
            category: food.category,
            restaurantId: food.restaurantId._id || food.restaurantId
        });
        setEditingId(food._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this food item?')) {
            try {
                await axios.post('http://localhost:5001/api/foods/remove', { id });
                toast.success('Food item deleted successfully');
                fetchFoods();
            } catch (error) {
                toast.error(`Failed to delete food item: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', description: '', price: '', category: '', restaurantId: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="food-page">
            <nav className="navbar navbar-dark bg-dark">
                <div className="container">
                    <span className="navbar-brand">Food Items Management</span>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add Food Item
                    </button>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Food Form */}
                {showForm && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>{editingId ? 'Edit Food Item' : 'Add New Food Item'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Category</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Price (₹)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={formData.price}
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Restaurant</label>
                                            <select
                                                className="form-control"
                                                value={formData.restaurantId}
                                                onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Restaurant</option>
                                                {restaurants.map(restaurant => (
                                                    <option key={restaurant._id} value={restaurant._id}>
                                                        {restaurant.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-success">
                                        {editingId ? 'Update' : 'Create'} Food Item
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Foods List */}
                <div className="card">
                    <div className="card-header">
                        <h5>All Food Items</h5>
                    </div>
                    <div className="card-body">
                        {foods.length === 0 ? (
                            <p className="text-center text-muted">No food items found</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Restaurant</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foods.map(food => (
                                            <tr key={food._id}>
                                                <td>{food.name}</td>
                                                <td>{food.description}</td>
                                                <td>{food.category}</td>
                                                <td>₹{food.price}</td>
                                                <td>{food.restaurantId?.name}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-warning me-2"
                                                        onClick={() => handleEdit(food)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(food._id)}
                                                    >
                                                        Delete
                                                    </button>
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

export default Food;