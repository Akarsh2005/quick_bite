import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [cart, setCart] = useState({});          // { foodId: qty }
    const [foods, setFoods] = useState([]);
    const [restaurants, setRestaurants] = useState([]);

    // ── Persist token / user ──────────────────────────────────────────
    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    // ── Load data when authenticated ─────────────────────────────────
    useEffect(() => {
        fetchFoods();
        fetchRestaurants();
        if (user?._id) fetchCart();
    }, [user]);

    const fetchFoods = async () => {
        try {
            const res = await API.get('/api/foods/list?limit=200');
            if (res.data.success) setFoods(res.data.data);
        } catch (_) {}
    };

    const fetchRestaurants = async () => {
        try {
            const res = await API.get('/api/restaurants/list?limit=100');
            if (res.data.success) setRestaurants(res.data.data);
        } catch (_) {}
    };

    const fetchCart = useCallback(async () => {
        try {
            const res = await API.post('/api/cart/get', { userId: user?._id });
            if (res.data.success) setCart(res.data.cartData || {});
        } catch (_) {}
    }, [user]);

    // ── Auth ──────────────────────────────────────────────────────────
    const login = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setCart({});
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // ── Cart ──────────────────────────────────────────────────────────
    const addToCart = async (foodId) => {
        try {
            await API.post('/api/cart/add', { userId: user?._id, itemId: foodId });
            setCart(prev => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
            toast.success('Added to cart!');
        } catch {
            toast.error('Failed to add to cart');
        }
    };

    const removeFromCart = async (foodId) => {
        try {
            await API.post('/api/cart/remove', { userId: user?._id, itemId: foodId });
            setCart(prev => {
                const next = { ...prev };
                if (next[foodId] > 1) next[foodId] -= 1;
                else delete next[foodId];
                return next;
            });
        } catch {
            toast.error('Failed to update cart');
        }
    };

    const clearCart = () => setCart({});

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    // ── Cart items enriched with food details ─────────────────────────
    const cartItems = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([foodId, qty]) => {
            const food = foods.find(f => f._id === foodId);
            return food ? { ...food, quantity: qty } : null;
        })
        .filter(Boolean);

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <AppContext.Provider value={{
            user, token, cart, foods, restaurants,
            cartCount, cartItems, cartTotal,
            login, logout,
            addToCart, removeFromCart, clearCart,
            fetchCart, fetchFoods, fetchRestaurants,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
