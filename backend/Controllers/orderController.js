import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { applyQueryFeatures } from "../Utils/queryHelper.js";

const frontend_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const placeOrder = async (req, res, next) => {
    try {
        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({ success: false, message: "Order items cannot be empty" });
        }

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ 
            success: true, 
            message: "Order placed successfully!",
            orderId: newOrder._id,
            session_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`
        });
    } catch (error) {
        next(error);
    }
};

const placeOrderCod = async (req, res, next) => {
    try {
        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({ success: false, message: "Order items cannot be empty" });
        }

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        next(error);
    }
};

const listOrders = async (req, res, next) => {
    try {
        const result = await applyQueryFeatures(orderModel, req.query, 'items.restaurantId');
        res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        next(error);
    }
};

const userOrders = async (req, res, next) => {
    try {
        const queryParams = { ...req.query, userId: req.body.userId };
        const result = await applyQueryFeatures(orderModel, queryParams);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        next(error);
    }
};

const verifyOrder = async (req, res, next) => {
    const { orderId, success } = req.body;
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment Verified" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        next(error);
    }
};

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod };