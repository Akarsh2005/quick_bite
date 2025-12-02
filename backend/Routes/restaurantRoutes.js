import express from 'express';
import { createRestaurant, listRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../Controllers/restaurantController.js';

const restaurantRouter = express.Router();

restaurantRouter.post("/add", createRestaurant);
restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/:id", getRestaurantById);
restaurantRouter.put("/:id", updateRestaurant);
restaurantRouter.delete("/:id", deleteRestaurant);

export default restaurantRouter;