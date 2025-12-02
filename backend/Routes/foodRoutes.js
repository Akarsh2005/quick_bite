import express from 'express';
import { addFood, listFood, removeFood, updateFood, listFoodByRestaurant } from '../Controllers/foodController.js';

const foodRouter = express.Router();

foodRouter.get("/list", listFood);
foodRouter.get("/restaurant/:restaurantId", listFoodByRestaurant);
foodRouter.post("/add", addFood);
foodRouter.put("/:id", updateFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;