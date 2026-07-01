import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { applyQueryFeatures } from "../Utils/queryHelper.js";
import Stripe from "stripe";

let stripeInstance = null;
const getStripe = () => {
    if (!stripeInstance) {
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
};
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

        // Build Stripe line items from order items
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Stripe uses paise
            },
            quantity: item.quantity,
        }));

        // Add delivery charge as a separate line item
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: { name: "Delivery Charge" },
                unit_amount: 5000, // ₹50 delivery charge
            },
            quantity: 1,
        });

        // Create Stripe checkout session
        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            metadata: { orderId: newOrder._id.toString() },
        });

        res.json({
            success: true,
            message: "Order created, proceed to payment",
            orderId: newOrder._id,
            session_url: session.url,
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