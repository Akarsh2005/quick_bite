import React from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Chatbot from "./components/Chatbot/Chatbot";

// Pages
import DummyPage from "./pages/DummyPage/DummyPage";
// Admin Pages
import AdminHome from "./pages/home/home";
import Restaurants from "./pages/restaurant/restaurant";
import Food from "./pages/food/food";
import Orders from "./pages/orders/orders";

const App = () => {
  return (
    <div className="app">
      <ToastContainer /> {/* optional, for showing toasts */}
      <Routes>
        {/* Public Routes */}
        <Route path="/dummy" element={<DummyPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/restaurants" element={<Restaurants />} />
        <Route path="/admin/foods" element={<Food />} />
        <Route path="/admin/orders" element={<Orders />} />

        {/* Redirect root to admin home */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
};

export default App;
