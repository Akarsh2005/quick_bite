import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

const addToCart = async (req, res, next) => {
    try {
        const food = await foodModel.findById(req.body.itemId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        let userData = await userModel.findOne({ _id: req.body.userId });
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};
        
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }
        
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};
        
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
            if (cartData[req.body.itemId] === 0) {
                delete cartData[req.body.itemId];
            }
        }
        
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
        next(error);
    }
};

const getCart = async (req, res, next) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        let cartData = userData.cartData || {};
        res.json({ success: true, cartData });
    } catch (error) {
        next(error);
    }
};

export { addToCart, removeFromCart, getCart };