import chatSessionModel from "../models/chatSessionModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import { pipeline } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let classifier = null;
let modelConfig = null;

// Load the trained model
const loadModel = async () => {
    try {
        console.log('🚀 Loading trained chatbot model...');
        const modelPath = './models/chatbot_model';
        const absoluteModelPath = path.join(process.cwd(), 'models', 'chatbot_model');
        
        if (!fs.existsSync(absoluteModelPath)) {
            console.log('❌ Model directory not found, using enhanced keyword fallback');
            return;
        }

        const files = fs.readdirSync(absoluteModelPath);
        const hasConfig = files.includes('config.json');
        const hasTokenizerConfig = files.includes('tokenizer_config.json');
        const hasTokenizer = files.includes('tokenizer.json');
        const hasSafetensors = files.includes('model.safetensors');
        const hasVocab = files.includes('vocab.txt');
        
        if (!hasConfig || !hasTokenizerConfig || !hasTokenizer || !hasSafetensors || !hasVocab) {
            console.log('❌ Required model files missing, using enhanced keyword fallback');
            return;
        }

        const configPath = path.join(absoluteModelPath, 'model_config.json');
        if (fs.existsSync(configPath)) {
            modelConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('✅ Model config loaded:', modelConfig.num_classes, 'classes');
        } else {
            modelConfig = {
                intents: ['fallback'],
                num_classes: 1
            };
        }

        console.log('🔄 Initializing classifier...');
        try {
            classifier = await pipeline(
                'text-classification',
                modelPath,
                { 
                    local_files_only: true,
                    revision: 'main'
                }
            );
            console.log('✅ Chatbot model loaded successfully');
        } catch (error) {
            console.log('❌ Model loading failed, using enhanced fallback:', error.message);
            classifier = null;
        }
        
    } catch (error) {
        console.log('❌ Error loading model, using enhanced fallback:', error.message);
        classifier = null;
    }
};

// Enhanced NLP Intent Classification
const classifyIntent = async (message, userType, previousIntents = []) => {
    let intent = 'fallback';
    let confidence = 0.7;

    try {
        if (classifier && modelConfig) {
            console.log('🤖 Using AI model for classification...');
            const results = await classifier(message);
            const topResult = results[0];
            
            let predictedIntent = topResult.label;
            let predictedConfidence = topResult.score;
            
            console.log(`🎯 Model prediction: ${predictedIntent} (${predictedConfidence})`);
            
            const userSpecificIntents = modelConfig.intents.filter(intentName => {
                if (userType === 'admin') {
                    return intentName.startsWith('admin_') || !intentName.startsWith('customer_');
                } else {
                    return intentName.startsWith('customer_') || !intentName.startsWith('admin_');
                }
            });
            
            if (userSpecificIntents.includes(predictedIntent) && predictedConfidence > 0.6) {
                return { intent: predictedIntent, confidence: predictedConfidence };
            }
        }
    } catch (error) {
        console.log('Model prediction failed, using enhanced keywords:', error.message);
    }

    return classifyWithEnhancedKeywords(message, userType, previousIntents);
};

// Enhanced keyword classification with better pattern matching
const classifyWithEnhancedKeywords = (message, userType, previousIntents = []) => {
    const messageLower = message.toLowerCase().trim();
    let intent = 'fallback';
    let confidence = 0.8;

    console.log('🔤 Using keyword classification for:', messageLower);

    // Check for follow-up patterns based on previous context
    const lastIntent = previousIntents[previousIntents.length - 1];
    
    if ((lastIntent === 'add_food' || lastIntent === 'admin_add_food') && 
        (messageLower.includes(',') || messageLower.match(/\d/))) {
        return { intent: 'process_food_details', confidence: 0.9 };
    }

    if ((lastIntent === 'add_restaurant' || lastIntent === 'admin_add_restaurant') && 
        (messageLower.includes(',') || messageLower.match(/\d/))) {
        return { intent: 'process_restaurant_details', confidence: 0.9 };
    }

    // Enhanced Admin intents with better pattern matching
    if (userType === 'admin') {
        // Restaurant management
        if (messageLower.match(/(add|create|new)\s+(?:restaurant)?:?\s*.+/i) && messageLower.includes('restaurant')) {
            if (messageLower.includes(',')) {
                intent = 'process_restaurant_details';
            } else {
                intent = 'admin_add_restaurant';
            }
            confidence = 0.9;
        } 
        else if (messageLower.match(/(list|show|display|view)\s+(?:all\s+)?restaurants?/i)) {
            intent = 'admin_list_restaurants';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(update|edit|change|modify)\s+restaurant/i)) {
            intent = 'admin_update_restaurant';
            confidence = 0.8;
        } 
        else if (messageLower.match(/(delete|remove|take\s+down)\s+restaurant/i)) {
            intent = 'admin_delete_restaurant';
            confidence = 0.8;
        }
        // Food management
        else if (messageLower.match(/(add|create|new)\s+(?:food|dish|item)?:?\s*.+/i) && 
                (messageLower.includes('food') || messageLower.includes('dish') || messageLower.includes('item'))) {
            if (messageLower.includes(',')) {
                intent = 'process_food_details';
            } else {
                intent = 'admin_add_food';
            }
            confidence = 0.9;
        } 
        else if (messageLower.match(/(list|show|display|view)\s+(?:all\s+)?(?:food|dish|item|menu)s?/i)) {
            intent = 'admin_list_foods';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(delete|remove|take\s+down)\s+(?:food|dish|item)/i)) {
            intent = 'admin_delete_food';
            confidence = 0.8;
        }
        // Order management
        else if (messageLower.match(/(list|show|display|view)\s+(?:all\s+)?orders?/i)) {
            intent = 'admin_list_orders';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(update|change|mark)\s+.*order.*(to|as|status)/i)) {
            intent = 'admin_process_status_update';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(update|change)\s+.*status/i)) {
            intent = 'admin_update_status';
            confidence = 0.8;
        }
        else if (messageLower.match(/(stat|dashboard|summary|report)/i)) {
            intent = 'admin_view_stats';
            confidence = 0.7;
        }
    } else {
        // Customer navigation triggers
        if (messageLower.match(/(go\s+to|navigate\s+to|show|view|open)\s+(?:my\s+)?orders/i)) {
            intent = 'customer_order_history';
            confidence = 0.95;
        }
        else if (messageLower.match(/(go\s+to|navigate\s+to|show|view|open)\s+cart/i)) {
            intent = 'customer_view_cart';
            confidence = 0.95;
        }
        else if (messageLower.match(/(go\s+to|navigate\s+to|go\s+home|homepage|main\s+page)/i)) {
            intent = 'customer_go_home';
            confidence = 0.95;
        }
        // Add to cart vs remove from cart triggers
        else if (messageLower.match(/(?:add|put|buy|insert)\s+/i)) {
            intent = 'customer_add_to_cart';
            confidence = 0.9;
        }
        else if (messageLower.match(/(?:remove|delete|discard|take\s+out|cancel)\s+/i)) {
            intent = 'customer_remove_from_cart';
            confidence = 0.9;
        }
        // Search & checkout triggers
        else if (messageLower.match(/(find|search|look.*for|show.*me|want|get|order).*(pizza|burger|pasta|sushi|salad|rice|noodles|chicken|biryani|dosa|idli|sandwich|fries)/i)) {
            intent = 'customer_search_food_name';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(find|search|show|want|get).*(italian|chinese|mexican|indian|japanese|fast food|asian|continental|south indian|north indian)/i)) {
            intent = 'customer_search_food_category';
            confidence = 0.8;
        } 
        else if (messageLower.match(/(checkout|place.*order|proceed.*payment|buy.*now|complete.*order)/i)) {
            intent = 'customer_place_order';
            confidence = 0.9;
        } 
        else if (messageLower.match(/(order.*history|past.*orders|previous.*orders|my.*orders|order.*list)/i)) {
            intent = 'customer_order_history';
            confidence = 0.8;
        } 
        else if (messageLower.match(/(track|where.*is|status|update).*order/i)) {
            intent = 'customer_track_order';
            confidence = 0.8;
        }
        else if (messageLower.match(/(list|show|view|see).*restaurants?/i)) {
            intent = 'customer_list_restaurants';
            confidence = 0.8;
        }
        else if (messageLower.match(/(help|support|what.*can.*you.*do|how.*to)/i)) {
            intent = 'customer_help';
            confidence = 0.9;
        }
        else if (messageLower.match(/(recommend|suggest|what.*should.*i.*order|best)/i)) {
            intent = 'customer_recommend_food';
            confidence = 0.8;
        }
        else if (messageLower.match(/(price|cost|how.*much|expensive)/i)) {
            intent = 'customer_ask_price';
            confidence = 0.7;
        }
        else if (messageLower.match(/(clear|empty).*cart/i)) {
            intent = 'customer_clear_cart';
            confidence = 0.8;
        }
    }

    console.log(`🎯 Keyword classification: ${intent} (${confidence})`);
    return { intent, confidence };
};

// Process restaurant details from comma-separated input
const processRestaurantDetails = async (message) => {
    try {
        // Extract details using regex to handle different formats
        const match = message.match(/(?:add|create|new)\s+restaurant:?\s*(.+)/i);
        const details = match ? match[1] : message;
        const parts = details.split(',').map(part => part.trim());
        
        if (parts.length < 3) {
            return "I need more details. Please provide: Restaurant Name, Address, Phone Number\n\nExample: 'Pizza Palace, 123 Main Street, 555-0123'";
        }

        const [name, address, phone] = parts;

        // Check if restaurant already exists
        const existingRestaurant = await restaurantModel.findOne({
            name: { $regex: name, $options: 'i' }
        });

        if (existingRestaurant) {
            return `❌ Restaurant "${name}" already exists!\n\n🏪 **${existingRestaurant.name}**\n📍 ${existingRestaurant.address}\n📞 ${existingRestaurant.phone}`;
        }

        // Create restaurant
        const restaurant = new restaurantModel({
            name: name,
            address: address,
            phone: phone
        });

        await restaurant.save();

        return `✅ Restaurant added successfully!\n\n🏪 **${name}**\n📍 ${address}\n📞 ${phone}\n\nYou can now add food items to this restaurant.`;

    } catch (error) {
        console.error('Error processing restaurant details:', error);
        return "❌ Error adding restaurant. Please check the format and try again.\n\nFormat: Restaurant Name, Address, Phone Number";
    }
};

// Process food details from comma-separated input
const processFoodDetails = async (message) => {
    try {
        // Extract details using regex to handle different formats
        const match = message.match(/(?:add|create|new)\s+food:?\s*(.+)/i);
        const details = match ? match[1] : message;
        const parts = details.split(',').map(part => part.trim());
        
        if (parts.length < 5) {
            return "I need more details. Please provide: Food Name, Description, Price, Category, Restaurant Name\n\nExample: 'Egg Rice, Fresh egg fried rice, 250, Rice, Arya Bhavan'";
        }

        const [name, description, priceStr, category, restaurantName] = parts;
        const price = parseFloat(priceStr);

        if (isNaN(price)) {
            return "Please provide a valid price. Example: '250' for ₹250";
        }

        // Find restaurant
        const restaurant = await restaurantModel.findOne({
            name: { $regex: restaurantName, $options: 'i' }
        });

        if (!restaurant) {
            const restaurants = await restaurantModel.find({});
            const restaurantList = restaurants.map(r => `• ${r.name}`).join('\n');
            return `❌ Restaurant "${restaurantName}" not found.\n\nAvailable restaurants:\n${restaurantList}`;
        }

        // Create food item
        const foodItem = new foodModel({
            name: name,
            description: description,
            price: price,
            category: category,
            restaurantId: restaurant._id
        });

        await foodItem.save();

        return `✅ Food item added successfully!\n\n🍽️ **${name}**\n📝 ${description}\n💰 ₹${price}\n🏷️ ${category}\n🏪 ${restaurant.name}`;

    } catch (error) {
        console.error('Error processing food details:', error);
        return "❌ Error adding food item. Please check the format and try again.\n\nFormat: Food Name, Description, Price, Category, Restaurant Name";
    }
};

// Delete restaurant function
const deleteRestaurant = async (message) => {
    try {
        // Extract restaurant name/ID from message
        const match = message.match(/(?:delete|remove)\s+restaurant\s+(.+)/i);
        const identifier = match ? match[1].trim() : message.replace(/(delete|remove)\s+restaurant/i, '').trim();

        if (!identifier) {
            return "Please specify which restaurant to delete.\n\nExample: 'Delete restaurant Pizza Palace'";
        }

        // Try to find restaurant by name or ID
        let restaurant = await restaurantModel.findOne({
            name: { $regex: identifier, $options: 'i' }
        });

        if (!restaurant) {
            // Try by ID
            restaurant = await restaurantModel.findById(identifier);
        }

        if (!restaurant) {
            const restaurants = await restaurantModel.find({});
            const restaurantList = restaurants.map(r => `• ${r.name} (ID: ${r._id})`).join('\n');
            return `❌ Restaurant not found.\n\nAvailable restaurants:\n${restaurantList}`;
        }

        // Delete associated food items first
        await foodModel.deleteMany({ restaurantId: restaurant._id });

        // Delete restaurant
        const restaurantName = restaurant.name;
        await restaurantModel.findByIdAndDelete(restaurant._id);

        return `✅ Restaurant deleted successfully!\n\n🗑️ **${restaurantName}** and all its food items have been removed.`;

    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return "❌ Error deleting restaurant. Please try again.";
    }
};

// Delete food item function
const deleteFoodItem = async (message) => {
    try {
        // Extract food name/ID from message
        const match = message.match(/(?:delete|remove)\s+(?:food|dish|item)\s+(.+)/i);
        const identifier = match ? match[1].trim() : message.replace(/(delete|remove)\s+(food|dish|item)/i, '').trim();

        if (!identifier) {
            return "Please specify which food item to delete.\n\nExample: 'Delete food Burger' or 'Remove food item pizza'";
        }

        // Try to find food by name or ID
        let foodItem = await foodModel.findOne({
            name: { $regex: identifier, $options: 'i' }
        }).populate('restaurantId');

        if (!foodItem) {
            // Try by ID
            foodItem = await foodModel.findById(identifier).populate('restaurantId');
        }

        if (!foodItem) {
            const foods = await foodModel.find({}).populate('restaurantId').limit(10);
            const foodList = foods.map(f => `• ${f.name} (Restaurant: ${f.restaurantId?.name})`).join('\n');
            return `❌ Food item not found.\n\nAvailable food items:\n${foodList}`;
        }

        const foodName = foodItem.name;
        const restaurantName = foodItem.restaurantId?.name;

        // Delete food item
        await foodModel.findByIdAndDelete(foodItem._id);

        return `✅ Food item deleted successfully!\n\n🗑️ **${foodName}** from ${restaurantName} has been removed.`;

    } catch (error) {
        console.error('Error deleting food item:', error);
        return "❌ Error deleting food item. Please try again.";
    }
};

// Process order status update with better parsing
const processStatusUpdate = async (message) => {
    try {
        // Improved regex to handle different formats
        const statusMatch = message.match(/(?:update|change|mark)\s+(?:order)?\s*(\w+)\s*(?:to|as)\s*([\w\s]+)/i);
        
        if (!statusMatch) {
            return "Please provide order update in format: 'Update order [orderId] to [status]'\n\nExamples:\n• 'Update order abc123 to Delivered'\n• 'Mark order xyz789 as Completed'\n• 'Change order status to Out for delivery'";
        }

        const orderId = statusMatch[1];
        let newStatus = statusMatch[2].trim();

        // Normalize status
        const statusMap = {
            'processing': 'Food Processing',
            'out for delivery': 'Out for delivery',
            'delivered': 'Delivered',
            'completed': 'Delivered',
            'cancelled': 'Cancelled',
            'canceled': 'Cancelled'
        };

        newStatus = statusMap[newStatus.toLowerCase()] || 
                   newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();

        // Valid statuses
        const validStatuses = ['Food Processing', 'Out for delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return `❌ Invalid status "${newStatus}". Valid statuses are: ${validStatuses.join(', ')}`;
        }

        // Find and update order
        const order = await orderModel.findById(orderId);
        if (!order) {
            // Try finding by any identifier field
            const orders = await orderModel.find({}).sort({ date: -1 }).limit(5);
            const orderList = orders.map(o => `• Order #${o._id} - ${o.status} - ₹${o.amount}`).join('\n');
            return `❌ Order ${orderId} not found.\n\nRecent orders:\n${orderList}`;
        }

        order.status = newStatus;
        await order.save();

        return `✅ Order ${orderId} status updated to: ${newStatus}\n\n📦 Order Details:\n💰 Amount: ₹${order.amount}\n📦 Items: ${order.items?.length || 0}\n📍 Status: ${newStatus}`;

    } catch (error) {
        console.error('Error processing status update:', error);
        return "❌ Error updating order status. Please check the order ID and try again.";
    }
};

// Enhanced Admin Intent Processing
const processAdminIntent = async (intent, message, session, userId, previousIntents = []) => {
    try {
        console.log(`🔄 Processing admin intent: ${intent}`);
        
        switch (intent) {
            case 'admin_add_restaurant':
                return "I can help you create a new restaurant. Please provide details in this format:\n\n**Name, Address, Phone Number**\n\nExample: 'Pizza Palace, 123 Main Street, 555-0123'";

            case 'admin_list_restaurants':
                const restaurants = await restaurantModel.find({});
                if (restaurants.length === 0) {
                    return "No restaurants found. You can add one using: 'Add restaurant: Name, Address, Phone'";
                }
                const restaurantList = restaurants.map(r => 
                    `🏪 **${r.name}**\n📍 ${r.address}\n📞 ${r.phone}\n🆔 ${r._id}`
                ).join('\n\n');
                return `**Restaurants (${restaurants.length}):**\n\n${restaurantList}`;

            case 'admin_add_food':
                const restaurantsForFood = await restaurantModel.find({});
                if (restaurantsForFood.length === 0) {
                    return "No restaurants available. Please create a restaurant first.";
                }
                const restaurantChoices = restaurantsForFood.map(r => r.name).join(', ');
                return `I can help you add food items. Please provide details in this format:\n\n**Food Name, Description, Price, Category, Restaurant Name**\n\nExample: 'Egg Rice, Fresh egg fried rice, 250, Rice, Arya Bhavan'\n\nAvailable restaurants: ${restaurantChoices}`;

            case 'process_restaurant_details':
                return await processRestaurantDetails(message);

            case 'process_food_details':
                return await processFoodDetails(message);

            case 'admin_list_foods':
                const foods = await foodModel.find({}).populate('restaurantId');
                if (foods.length === 0) {
                    return "No food items found. Add some using: 'Add food: Name, Description, Price, Category, Restaurant'";
                }
                const foodList = foods.map(f => 
                    `🍽️ **${f.name}** - ₹${f.price}\n📝 ${f.description}\n🏷️ ${f.category}\n🏪 ${f.restaurantId?.name || 'Unknown'}`
                ).join('\n\n');
                return `**Food Menu (${foods.length} items):**\n\n${foodList}`;

            case 'admin_delete_restaurant':
                return await deleteRestaurant(message);

            case 'admin_delete_food':
                return await deleteFoodItem(message);

            case 'admin_list_orders':
                const orders = await orderModel.find({}).sort({ date: -1 }).limit(10);
                if (orders.length === 0) {
                    return "No orders found in the system.";
                }
                const orderList = orders.map(o => {
                    const itemCount = o.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
                    return `📦 **Order ${o._id}**\n💰 ₹${o.amount} | 📦 ${o.status}\n📅 ${new Date(o.date).toLocaleDateString()}\n🍽️ ${itemCount} items`;
                }).join('\n\n');
                return `**Recent Orders (${orders.length}):**\n\n${orderList}`;

            case 'admin_update_status':
                return "I can help you update order status. Please provide in format:\n\n**Update order [orderId] to [status]**\n\nExample: 'Update order abc123 to Delivered'\n\nAvailable statuses: Food Processing, Out for delivery, Delivered, Cancelled";

            case 'admin_process_status_update':
                return await processStatusUpdate(message);

            case 'admin_view_stats':
                const totalRestaurants = await restaurantModel.countDocuments();
                const totalFoods = await foodModel.countDocuments();
                const totalOrders = await orderModel.countDocuments();
                const totalUsers = await userModel.countDocuments();
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayOrders = await orderModel.find({ 
                    date: { $gte: today },
                    payment: true 
                });
                const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);
                
                return `📊 **Dashboard Summary:**\n\n🏪 Restaurants: ${totalRestaurants}\n🍕 Food Items: ${totalFoods}\n📦 Total Orders: ${totalOrders}\n👥 Registered Users: ${totalUsers}\n💰 Today's Revenue: ₹${todayRevenue}`;

            default:
                return "I can help you with:\n\n🏪 **Restaurant Management**\n- Add/List/Update/Delete restaurants\n\n🍕 **Food Management**\n- Add/List/Remove food items\n\n📦 **Order Management**\n- View orders & update status\n\n📊 **Statistics**\n- View dashboard stats\n\nWhat would you like to do?";
        }
    } catch (error) {
        console.error('Error processing admin intent:', error);
        return "❌ Error processing your request. Please try again.";
    }
};

// Enhanced Customer Intent Processing with Authentication
const processCustomerIntent = async (intent, message, session, userId, token) => {
    try {
        console.log(`🔄 Processing customer intent: ${intent}`);
        
        // Verify user authentication for protected intents
        const protectedIntents = [
            'customer_view_cart', 
            'customer_order_history', 
            'customer_track_order',
            'customer_place_order',
            'customer_add_to_cart',
            'customer_remove_from_cart',
            'customer_clear_cart'
        ];

        if (protectedIntents.includes(intent)) {
            if (!token || userId.startsWith('guest_')) {
                return `🔒 Please log in to perform cart or order actions. You can log in from the login page!`;
            }

            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const authenticatedUserId = decoded.id;
                
                // Ensure the userId from token matches the session
                if (authenticatedUserId !== userId && !userId.startsWith('admin_')) {
                    return "🔒 Authentication error. Please log in again.";
                }
            } catch (authError) {
                console.error('Token verification failed:', authError);
                return "🔒 Your session has expired. Please log in again to continue.";
            }
        }

        const user = await userModel.findById(userId);

        switch (intent) {
            case 'customer_search_food_name':
                const searchTerm = extractSearchTerm(message);
                const foods = await foodModel.find({ 
                    name: { $regex: searchTerm, $options: 'i' } 
                }).populate('restaurantId').limit(8);
                
                if (foods.length === 0) {
                    return `🔍 No "${searchTerm}" items found. Try searching for: pizza, burger, pasta, salad, rice, noodles, chicken, biryani`;
                }
                
                const foodResults = foods.map(f => 
                    `🍽️ **${f.name}** - ₹${f.price}\n📝 ${f.description}\n🏪 ${f.restaurantId?.name}\n🏷️ ${f.category}`
                ).join('\n\n');
                return `🔍 **Found ${foods.length} ${searchTerm} items:**\n\n${foodResults}\n\n💡 You can ask me to add any of these to your cart! (e.g. "add ${foods[0].name}")`;

            case 'customer_search_food_category':
                const category = extractCategory(message);
                const categoryFoods = await foodModel.find({ 
                    category: { $regex: category, $options: 'i' } 
                }).populate('restaurantId').limit(8);
                
                if (categoryFoods.length === 0) {
                    return `🔍 No "${category}" food found. Try: Italian, Chinese, Mexican, Indian, Japanese, Fast Food, South Indian`;
                }
                
                const categoryResults = categoryFoods.map(f => 
                    `🍽️ **${f.name}** - ₹${f.price}\n📝 ${f.description}\n🏪 ${f.restaurantId?.name}\n🏷️ ${f.category}`
                ).join('\n\n');
                return `🔍 **Found ${categoryFoods.length} ${category} items:**\n\n${categoryResults}`;

            case 'customer_view_cart':
                if (!user) {
                    return "❌ User not found. Please log in again.";
                }
                
                const cartItems = Object.keys(user?.cartData || {});
                
                if (cartItems.length === 0) {
                    return "🛒 Your cart is empty! Browse our menu and add some delicious items to get started! [NAVIGATE] /cart";
                }
                
                const cartFoods = await foodModel.find({ _id: { $in: cartItems } });
                const cartDetails = cartFoods.map(food => {
                    const quantity = user.cartData[food._id.toString()] || 0;
                    const itemTotal = food.price * quantity;
                    return `• ${food.name} x${quantity} - ₹${itemTotal}`;
                }).join('\n');
                
                const total = cartFoods.reduce((sum, food) => {
                    const quantity = user.cartData[food._id.toString()] || 0;
                    return sum + (food.price * quantity);
                }, 0);
                
                return `🛒 **Your Cart** (${cartItems.length} items):\n\n${cartDetails}\n\n💰 **Total: ₹${total}**\n\n🚀 Opening your cart page... [NAVIGATE] /cart`;

            case 'customer_add_to_cart': {
                if (!user) return "❌ User not found.";
                
                // Smart matching algorithm to find what food the user wants
                const allFoods = await foodModel.find({});
                let matchedFood = null;
                const messageLower = message.toLowerCase();

                for (const food of allFoods) {
                    if (messageLower.includes(food.name.toLowerCase())) {
                        matchedFood = food;
                        break;
                    }
                }

                if (!matchedFood) {
                    // Try word-by-word fallback matching
                    const words = messageLower.split(/\s+/);
                    for (const food of allFoods) {
                        const foodWords = food.name.toLowerCase().split(/\s+/);
                        if (foodWords.some(w => w.length > 3 && words.includes(w))) {
                            matchedFood = food;
                            break;
                        }
                    }
                }

                if (!matchedFood) {
                    return "🛒 I couldn't identify which food item you want to add. Please specify the exact name (e.g. \"add Margherita Pizza\" or \"add Chicken Burger\").";
                }

                // Add to cart in database
                const foodId = matchedFood._id.toString();
                const currentCart = user.cartData || {};
                currentCart[foodId] = (currentCart[foodId] || 0) + 1;
                
                await userModel.findByIdAndUpdate(userId, { cartData: currentCart });
                
                return `✅ Added 1x **${matchedFood.name}** (₹${matchedFood.price}) to your cart successfully! [ACTION] sync_cart`;
            }

            case 'customer_remove_from_cart': {
                if (!user) return "❌ User not found.";
                
                const cartItems = Object.keys(user.cartData || {});
                if (cartItems.length === 0) {
                    return "🛒 Your cart is already empty!";
                }

                const cartFoods = await foodModel.find({ _id: { $in: cartItems } });
                let matchedFood = null;
                const messageLower = message.toLowerCase();

                for (const food of cartFoods) {
                    if (messageLower.includes(food.name.toLowerCase())) {
                        matchedFood = food;
                        break;
                    }
                }

                if (!matchedFood) {
                    const words = messageLower.split(/\s+/);
                    for (const food of cartFoods) {
                        const foodWords = food.name.toLowerCase().split(/\s+/);
                        if (foodWords.some(w => w.length > 3 && words.includes(w))) {
                            matchedFood = food;
                            break;
                        }
                    }
                }

                if (!matchedFood) {
                    return "🛒 I couldn't find that item in your cart. Please verify the name or check your cart using \"view cart\".";
                }

                const foodId = matchedFood._id.toString();
                const currentCart = user.cartData || {};
                
                if (currentCart[foodId] > 1) {
                    currentCart[foodId] -= 1;
                } else {
                    delete currentCart[foodId];
                }
                
                await userModel.findByIdAndUpdate(userId, { cartData: currentCart });
                
                return `❌ Removed 1x **${matchedFood.name}** from your cart. [ACTION] sync_cart`;
            }

            case 'customer_place_order': {
                if (!user) return "❌ User not found.";
                const cartItems = Object.keys(user.cartData || {});
                if (cartItems.length === 0) {
                    return "🛒 Your cart is empty! Add some delicious food items first.";
                }

                // If user specifies address directly in checkout trigger, extract it
                let addressInfo = "";
                const addressMatch = message.match(/(?:address|at|to)\s+(.+)/i);
                if (addressMatch) {
                    addressInfo = `?address=${encodeURIComponent(addressMatch[1].trim())}`;
                }

                return `🚀 Opening secure checkout window... [NAVIGATE] /placeorder${addressInfo}`;
            }

            case 'customer_go_home':
                return "🏠 Opening menu and home screen... [NAVIGATE] /";

            case 'customer_order_history':
                const orders = await orderModel.find({ userId }).sort({ date: -1 }).limit(5);
                
                if (orders.length === 0) {
                    return "📦 You haven't placed any orders yet. Ready to try our delicious food? Browse our menu to get started! [NAVIGATE] /orders";
                }
                
                const orderHistory = orders.map(o => {
                    const itemCount = o.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
                    return `📦 **Order #${o._id.toString().slice(-6)}**\n💰 ₹${o.amount} | 📦 ${o.status}\n📅 ${new Date(o.date).toLocaleDateString()}\n🍽️ ${itemCount} items`;
                }).join('\n\n');
                return `📦 **Your Recent Orders:**\n\n${orderHistory}\n\n🚀 Opening your orders logs... [NAVIGATE] /orders`;

            case 'customer_track_order':
                const currentOrders = await orderModel.find({ 
                    userId, 
                    status: { $in: ['Food Processing', 'Out for delivery'] } 
                }).sort({ date: -1 }).limit(3);
                
                if (currentOrders.length === 0) {
                    const deliveredOrders = await orderModel.find({ 
                        userId,
                        status: 'Delivered'
                    }).sort({ date: -1 }).limit(1);
                    
                    if (deliveredOrders.length > 0) {
                        return "📦 All your recent orders have been delivered! 🎉 [NAVIGATE] /orders";
                    }
                    return "📦 You don't have any active orders to track. [NAVIGATE] /orders";
                }
                
                const trackOrders = currentOrders.map(o => 
                    `📦 **Order #${o._id.toString().slice(-6)}**\n📍 Status: ${o.status}\n💰 Amount: ₹${o.amount}\n📅 Ordered: ${new Date(o.date).toLocaleDateString()}`
                ).join('\n\n');
                return `📦 **Your Active Orders:**\n\n${trackOrders}\n\n🕒 Redirecting you to orders view... [NAVIGATE] /orders`;

            case 'customer_list_restaurants':
                const restaurants = await restaurantModel.find({});
                if (restaurants.length === 0) {
                    return "🏪 No restaurants available at the moment. Please check back later!";
                }
                const restaurantList = restaurants.map(r => 
                    `🏪 **${r.name}**\n📍 ${r.address}\n📞 ${r.phone}`
                ).join('\n\n');
                return `🏪 **Available Restaurants:**\n\n${restaurantList}\n\n🍽️ Browse each restaurant's menu to see their delicious offerings!`;

            case 'customer_recommend_food':
                // Get popular food items
                const popularFoods = await foodModel.find({})
                    .populate('restaurantId')
                    .sort({ price: 1 })
                    .limit(5);
                
                if (popularFoods.length === 0) {
                    return "🍽️ I'd love to recommend some food, but our menu is currently being updated. Check back soon for delicious recommendations!";
                }
                
                const recommendations = popularFoods.map(f => 
                    `⭐ **${f.name}** - ₹${f.price}\n📝 ${f.description}\n🏪 ${f.restaurantId?.name}`
                ).join('\n\n');
                return `🍽️ **Popular Recommendations:**\n\n${recommendations}\n\n💡 These are some of our customer favorites!`;

            case 'customer_ask_price':
                return "💰 Our food prices range from ₹150 to ₹500 depending on the item and restaurant.\n\n• 🍕 Pizza: ₹250-₹400\n• 🍔 Burgers: ₹180-₹300\n• 🍝 Pasta: ₹200-₹350\n• 🍚 Rice dishes: ₹150-₹280\n• 🥗 Salads: ₹180-₹250\n\n💡 You can search for specific items to see exact prices!";

            case 'customer_clear_cart':
                return "🗑️ To clear your cart:\n\n1. Go to your cart page\n2. Click on the 'Clear Cart' button\n3. Confirm your action\n\nYour cart will be emptied and ready for new items!";

            case 'customer_help':
                return "🍕 **How I can help you:**\n\n🔍 **Find Food** - Search by name or cuisine type\n🛒 **Cart Management** - View cart, add items, checkout\n📦 **Order Tracking** - Track current orders & view history\n🏪 **Restaurants** - Browse available restaurants\n💰 **Pricing** - Get price information\n⭐ **Recommendations** - Get food suggestions\n\n**Try these commands:**\n• 'Find pizza'\n• 'Show my cart'  \n• 'Track my order'\n• 'Italian food'\n• 'What do you recommend?'\n\nI'm here to make your food ordering experience delightful! 😊";

            default:
                return "👋 Hi! I'm your food assistant! 🍕\n\nI can help you:\n\n🔍 **Find delicious food** - Search by name or cuisine\n🛒 **Manage your cart** - View and manage items\n📦 **Track orders** - Check order status\n🏪 **Browse restaurants** - Discover new places\n💰 **Get pricing** - Check food prices\n⭐ **Get recommendations** - Discover popular items\n\n**What would you like to do today?**\n\nTry: 'Find pizza', 'Show my cart', or 'Track my order'";
        }
    } catch (error) {
        console.error('Error processing customer intent:', error);
        return "😅 Sorry, I'm having trouble right now. Please try again or use the app interface for a smoother experience.";
    }
};

// Helper functions
const extractSearchTerm = (message) => {
    const terms = ['pizza', 'burger', 'pasta', 'sushi', 'salad', 'rice', 'noodles', 'chicken', 'biryani', 'dosa', 'idli', 'sandwich', 'fries'];
    const found = terms.find(term => message.toLowerCase().includes(term));
    return found || message.split(' ').pop() || 'food';
};

const extractCategory = (message) => {
    const categories = ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'fast food', 'asian', 'continental', 'south indian', 'north indian'];
    const found = categories.find(cat => message.toLowerCase().includes(cat));
    return found || 'food';
};

// Get Chat History
const getChatHistory = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const messages = await chatMessageModel.find({ sessionId }).sort({ timestamp: 1 }).limit(50);
        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// Admin Chat Handler
const handleAdminChatMessage = async (req, res, next) => {
    try {
        const { message, sessionId, userId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const finalUserId = userId || `admin_${Date.now()}`;
        const userType = 'admin';

        console.log(`💬 Admin message: "${message}" from ${finalUserId}`);

        // Get or create session with conversation context
        let session = await chatSessionModel.findOne({ sessionId });
        if (!session) {
            session = new chatSessionModel({
                sessionId: sessionId || `admin_session_${Date.now()}`,
                userId: finalUserId,
                userType: userType,
                context: { previousIntents: [] }
            });
        }

        // Get previous intents for context
        const previousMessages = await chatMessageModel.find({ 
            sessionId: session.sessionId,
            sender: 'user'
        }).sort({ timestamp: -1 }).limit(3);

        const previousIntents = previousMessages.map(msg => msg.intent);

        // Classify intent with context
        const { intent, confidence } = await classifyIntent(message, session.userType, previousIntents);

        // Save user message
        const userMessage = new chatMessageModel({
            sessionId: session.sessionId,
            message,
            sender: 'user',
            intent,
            confidence
        });
        await userMessage.save();

        // Generate response using admin processor
        const botResponse = await processAdminIntent(intent, message, session, finalUserId, previousIntents);

        // Save bot response
        const botMessage = new chatMessageModel({
            sessionId: session.sessionId,
            message: botResponse,
            sender: 'bot',
            intent,
            confidence
        });
        await botMessage.save();

        // Update session context
        session.context.previousIntents = [...previousIntents.slice(-2), intent];
        session.updatedAt = new Date();
        await session.save();

        const modelUsed = classifier ? 'ai_model' : 'enhanced_keywords';
        console.log(`✅ Admin response generated using: ${modelUsed}`);

        res.json({
            success: true,
            response: botResponse,
            intent,
            confidence,
            sessionId: session.sessionId,
            modelUsed
        });

    } catch (error) {
        next(error);
    }
};

// Customer Chat Handler with Authentication
const handleCustomerChatMessage = async (req, res, next) => {
    try {
        const { message, sessionId, userId } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        let finalUserId = userId;
        let authenticatedUser = null;

        // Verify token and get user info
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                authenticatedUser = await userModel.findById(decoded.id);
                if (authenticatedUser) {
                    finalUserId = authenticatedUser._id.toString();
                }
            } catch (error) {
                console.log('Token verification failed, using guest mode:', error.message);
            }
        }

        // If no authenticated user, use guest mode
        if (!authenticatedUser) {
            finalUserId = finalUserId || `guest_${Date.now()}`;
        }

        const userType = 'customer';

        console.log(`💬 Customer message: "${message}" from ${finalUserId} (${authenticatedUser ? 'authenticated' : 'guest'})`);

        // Get or create session with conversation context
        let session = await chatSessionModel.findOne({ sessionId });
        if (!session) {
            session = new chatSessionModel({
                sessionId: sessionId || `customer_session_${Date.now()}`,
                userId: finalUserId,
                userType: userType,
                context: { previousIntents: [] }
            });
        }

        // Get previous intents for context
        const previousMessages = await chatMessageModel.find({ 
            sessionId: session.sessionId,
            sender: 'user'
        }).sort({ timestamp: -1 }).limit(3);

        const previousIntents = previousMessages.map(msg => msg.intent);

        // Classify intent with context
        const { intent, confidence } = await classifyIntent(message, session.userType, previousIntents);

        // Save user message
        const userMessage = new chatMessageModel({
            sessionId: session.sessionId,
            message,
            sender: 'user',
            intent,
            confidence
        });
        await userMessage.save();

        // Generate response using customer processor with token
        const botResponse = await processCustomerIntent(intent, message, session, finalUserId, token);

        // Save bot response
        const botMessage = new chatMessageModel({
            sessionId: session.sessionId,
            message: botResponse,
            sender: 'bot',
            intent,
            confidence
        });
        await botMessage.save();

        // Update session context
        session.context.previousIntents = [...previousIntents.slice(-2), intent];
        session.updatedAt = new Date();
        await session.save();

        const modelUsed = classifier ? 'ai_model' : 'enhanced_keywords';
        console.log(`✅ Customer response generated using: ${modelUsed}`);

        res.json({
            success: true,
            response: botResponse,
            intent,
            confidence,
            sessionId: session.sessionId,
            modelUsed,
            userId: finalUserId,
            isAuthenticated: !!authenticatedUser
        });

    } catch (error) {
        next(error);
    }
};

// Initialize model on startup
loadModel();

export { handleAdminChatMessage, handleCustomerChatMessage, getChatHistory };