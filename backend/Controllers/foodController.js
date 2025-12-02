import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({}).populate('restaurantId');
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving food items" });
    }
};

const listFoodByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const foods = await foodModel.find({ restaurantId }).populate('restaurantId');
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving food items" });
    }
};

const addFood = async (req, res) => {
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
        console.log(error);
        res.json({ success: false, message: "Error adding food item" });
    }
};

const removeFood = async (req, res) => {
    try {
        const { id } = req.body;
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        await foodModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Food Removed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food item" });
    }
};

const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, restaurantId } = req.body;

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
        console.log(error);
        res.json({ success: false, message: "Error updating food item" });
    }
};

export { listFood, addFood, removeFood, updateFood, listFoodByRestaurant };