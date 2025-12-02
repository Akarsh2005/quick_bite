import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
// import './restaurant.css';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

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
            if (editingId) {
                // Update restaurant
                await axios.put(`http://localhost:5001/api/restaurants/${editingId}`, formData);
                toast.success('Restaurant updated successfully');
            } else {
                // Create restaurant
                await axios.post('http://localhost:5001/api/restaurants/add', formData);
                toast.success('Restaurant created successfully');
            }
            setFormData({ name: '', address: '', phone: '' });
            setEditingId(null);
            setShowForm(false);
            fetchRestaurants();
        } catch (error) {
            toast.error(`Failed to save restaurant: ${error.message}`);
        }
    };

    const handleEdit = (restaurant) => {
        setFormData({
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone
        });
        setEditingId(restaurant._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                await axios.delete(`http://localhost:5001/api/restaurants/${id}`);
                toast.success('Restaurant deleted successfully');
                fetchRestaurants();
            } catch (error) {
                toast.error(`Failed to delete restaurant: ${error.message}`);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', address: '', phone: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="restaurants-page">
            <nav className="navbar navbar-dark bg-dark">
                <div className="container">
                    <span className="navbar-brand">Restaurants Management</span>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add Restaurant
                    </button>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Restaurant Form */}
                {showForm && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-4">
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
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-success">
                                        {editingId ? 'Update' : 'Create'} Restaurant
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Restaurants List */}
                <div className="card">
                    <div className="card-header">
                        <h5>All Restaurants</h5>
                    </div>
                    <div className="card-body">
                        {restaurants.length === 0 ? (
                            <p className="text-center text-muted">No restaurants found</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Address</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restaurants.map(restaurant => (
                                            <tr key={restaurant._id}>
                                                <td>{restaurant.name}</td>
                                                <td>{restaurant.address}</td>
                                                <td>{restaurant.phone}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-warning me-2"
                                                        onClick={() => handleEdit(restaurant)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(restaurant._id)}
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

export default Restaurants;