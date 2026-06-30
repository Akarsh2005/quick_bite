import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import { applyQueryFeatures } from "../Utils/queryHelper.js";

const listFood = async (req, res, next) => {
    try {
        const result = await applyQueryFeatures(foodModel, req.query, 'restaurantId');
        res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        next(error);
    }
};

const listFoodByRestaurant = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const foods = await foodModel.find({ restaurantId }).populate('restaurantId');
        res.json({ success: true, data: foods });
    } catch (error) {
        next(error);
    }
};

const addFood = async (req, res, next) => {
    try {
        const { name, description, price, category, restaurantId } = req.body;

        const restaurant = await restaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        const food = new foodModel({
            name,
            description,
            price,
            category,
            restaurantId
        });

        await food.save();
        res.json({ success: true, message: "Food Added", data: food });
    } catch (error) {
        next(error);
    }
};

const removeFood = async (req, res, next) => {
    try {
        const { id } = req.body;
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        await foodModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Food Removed" });

    } catch (error) {
        next(error);
    }
};

const updateFood = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, restaurantId } = req.body;

        if (restaurantId) {
            const restaurant = await restaurantModel.findById(restaurantId);
            if (!restaurant) {
                return res.status(404).json({ success: false, message: "Restaurant not found" });
            }
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            id,
            { name, description, price, category, restaurantId },
            { new: true }
        ).populate('restaurantId');

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        res.json({ success: true, message: "Food Updated", data: updatedFood });
    } catch (error) {
        next(error);
    }
};

export { listFood, addFood, removeFood, updateFood, listFoodByRestaurant };