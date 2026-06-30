import restaurantModel from "../models/restaurantModel.js";
import { applyQueryFeatures } from "../Utils/queryHelper.js";

const listRestaurants = async (req, res, next) => {
    try {
        const result = await applyQueryFeatures(restaurantModel, req.query);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        next(error);
    }
};

const createRestaurant = async (req, res, next) => {
    try {
        const { name, address, phone } = req.body;
        const newRestaurant = new restaurantModel({ name, address, phone });
        await newRestaurant.save();

        res.status(201).json({ success: true, data: newRestaurant });
    } catch (error) {
        next(error);
    }
};

const getRestaurantById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, data: restaurant });
    } catch (error) {
        next(error);
    }
};

const updateRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, phone } = req.body;

        const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
            id, 
            { name, address, phone }, 
            { new: true }
        );
        if (!updatedRestaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, data: updatedRestaurant });
    } catch (error) {
        next(error);
    }
};

const deleteRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedRestaurant = await restaurantModel.findByIdAndDelete(id);
        if (!deletedRestaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, message: "Restaurant deleted" });
    } catch (error) {
        next(error);
    }
};

export { createRestaurant, listRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant };