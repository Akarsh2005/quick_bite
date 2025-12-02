import restaurantModel from "../models/restaurantModel.js";

const listRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({});
        res.json({ success: true, data: restaurants });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving restaurants" });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        if (!name || !address || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newRestaurant = new restaurantModel({ name, address, phone });
        await newRestaurant.save();

        res.status(201).json({ success: true, data: newRestaurant });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating restaurant" });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, data: restaurant });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving restaurant" });
    }
};

const updateRestaurant = async (req, res) => {
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
        console.log(error);
        res.json({ success: false, message: "Error updating restaurant" });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRestaurant = await restaurantModel.findByIdAndDelete(id);
        if (!deletedRestaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        res.json({ success: true, message: "Restaurant deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting restaurant" });
    }
};

export { createRestaurant, listRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant };