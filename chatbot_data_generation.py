import pandas as pd
import random
from faker import Faker
import json
import os

fake = Faker()

def generate_enhanced_dataset():
    data = []
    
    # Enhanced Admin Intents with more variations
    admin_intents = {
        'list_restaurants': [
            "Show all restaurants", "List restaurants", "Display restaurants",
            "What restaurants do we have?", "Show restaurant list",
            "Get all restaurants", "View restaurants", "Restaurant list please",
            "Can you show restaurants?", "I want to see all restaurants",
            "Show me the restaurants", "Display all restaurants",
            "List all restaurants in system", "What restaurants are available?",
            "Show available restaurants", "Restaurants menu",
            "Show restaurant database", "View all restaurants",
            "Display restaurant list", "Show me restaurants",
            "Need restaurant list", "Give me restaurant details",
            "Restaurant information", "All restaurant data",
            "Current restaurants", "Active restaurants"
        ] * 5,
        
        'list_foods': [
            "Show all food items", "List food items", "Display menu",
            "What food items do we have?", "Show food list",
            "Get all food items", "View food menu", "Food list please",
            "Can you show food items?", "I want to see all foods",
            "Show me the food menu", "Display all foods",
            "List all food items", "What food is available?",
            "Show available food", "Food menu",
            "Show food database", "View all food items",
            "Display food list", "Show me food items",
            "Menu items list", "All dishes available",
            "Current food menu", "Food inventory"
        ] * 5,
        
        'list_orders': [
            "Show all orders", "List orders", "Display orders",
            "What orders do we have?", "Show order list",
            "Get all orders", "View orders", "Order list please",
            "Can you show orders?", "I want to see all orders",
            "Show me the orders", "Display all orders",
            "List all orders", "What orders are pending?",
            "Show recent orders", "Orders database",
            "Show order database", "View all orders",
            "Display order list", "Show me orders",
            "Order history", "All placed orders",
            "Current orders status", "Pending orders list"
        ] * 5,
        
        'add_restaurant': [
            "Add new restaurant", "Create restaurant", "New restaurant",
            "Add a restaurant", "Create new restaurant",
            "Register restaurant", "Add restaurant to system",
            "Create a restaurant", "Add new food place",
            "Register new restaurant", "Add restaurant entry",
            "Create restaurant entry", "Add dining place",
            "Register food outlet", "Add new outlet",
            "Create food establishment", "Add restaurant profile",
            "Register restaurant profile", "Add new restaurant entry",
            "Add restaurant: Pizza Palace, 123 Main St, 555-0123",
            "Create restaurant: Burger King, 456 Oak Ave, 555-0456",
            "New restaurant: Sushi Place, 789 Pine Rd, 555-0789"
        ] * 5,
        
        'add_food': [
            "Add new food item", "Create food item", "New food item",
            "Add a food item", "Create new food",
            "Register food item", "Add food to menu",
            "Create a food item", "Add new dish",
            "Register new food", "Add food entry",
            "Create food entry", "Add new menu item",
            "Register dish", "Add new food product",
            "Create food product", "Add menu item",
            "Register menu item", "Add new food entry",
            "Add food: Burger, Beef burger with cheese, 180, Fast Food, Pizza Palace",
            "Create food: Pizza, Margherita pizza, 300, Italian, Pizza Palace",
            "Add dish: Pasta, Creamy Alfredo pasta, 250, Italian, Italian Bistro"
        ] * 5,
        
        'update_order_status': [
            "Update order status", "Change order status", "Modify order status",
            "Update order state", "Change order state",
            "Modify order state", "Update delivery status",
            "Change delivery status", "Update order progress",
            "Change order progress", "Mark order as delivered",
            "Update order to delivered", "Change status of order",
            "Modify order delivery", "Update order completion",
            "Update order abc123 to Delivered",
            "Change order xyz789 to Preparing",
            "Mark order def456 as Completed"
        ] * 5,
        
        'delete_restaurant': [
            "Delete restaurant", "Remove restaurant", "Delete a restaurant",
            "Remove a restaurant", "Delete restaurant entry",
            "Remove restaurant from system", "Delete food place",
            "Remove dining place", "Delete restaurant profile",
            "Remove restaurant entry", "Delete outlet",
            "Remove food outlet", "Delete establishment",
            "Remove food establishment", "Delete restaurant record"
        ] * 5,
        
        'delete_food': [
            "Delete food item", "Remove food item", "Delete a food item",
            "Remove a food item", "Delete food entry",
            "Remove food from menu", "Delete dish",
            "Remove dish", "Delete menu item",
            "Remove menu item", "Delete food product",
            "Remove food product", "Delete food record"
        ] * 5,
        
        'view_stats': [
            "Show statistics", "View dashboard", "Display stats",
            "Show report", "View summary",
            "Display analytics", "Show performance",
            "View metrics", "Display dashboard",
            "Show business stats", "View sales data",
            "Display revenue report", "Show order analytics"
        ] * 5
    }
    
    # Enhanced Customer Intents
    customer_intents = {
        'search_food_name': [
            "Find pizza", "Search for burger", "Look for pasta",
            "Find sushi", "Search salad", "Look for rice",
            "Find noodles", "Search sandwich", "Look for dessert",
            "Find beverages", "Search drinks", "Look for appetizers"
        ] * 8,
        
        'search_food_category': [
            "Find Italian food", "Search Chinese", "Look for Mexican",
            "Find Indian cuisine", "Search Japanese", "Look for Thai",
            "Find fast food", "Search vegetarian", "Look for vegan options"
        ] * 8,
        
        'view_cart': [
            "Show cart", "View cart", "Display cart",
            "What's in my cart?", "Show my cart",
            "View my cart", "Display my cart",
            "Show shopping cart", "View basket",
            "Show basket", "What do I have in cart?"
        ] * 8,
        
        'add_to_cart': [
            "Add to cart", "Put in cart", "Add item to cart",
            "Add to basket", "Put in basket",
            "Add to shopping cart", "Include in order",
            "Add this to cart", "Put this in cart"
        ] * 8,
        
        'place_order': [
            "Checkout", "Place order", "Order now",
            "Proceed to checkout", "Complete order",
            "Make order", "Submit order",
            "Finalize order", "Confirm order"
        ] * 8,
        
        'order_history': [
            "My orders", "Order history", "Past orders",
            "View my orders", "Show my orders",
            "Display my orders", "Order tracking",
            "My order history", "Previous orders"
        ] * 8,
        
        'track_order': [
            "Track order", "Where is my order", "Order status",
            "Check order progress", "Order delivery status",
            "My order tracking", "Where's my food"
        ] * 8
    }
    
    # Generate admin data
    for intent, samples in admin_intents.items():
        for text in samples:
            data.append({
                "text": text,
                "intent": f"admin_{intent}",
                "user_type": "admin"
            })
    
    # Generate customer data  
    for intent, samples in customer_intents.items():
        for text in samples:
            data.append({
                "text": text,
                "intent": f"customer_{intent}",
                "user_type": "customer"
            })
    
    return data

# Generate and save dataset
print("Generating enhanced chatbot dataset...")
dataset = generate_enhanced_dataset()
df = pd.DataFrame(dataset)

print(f"Generated {len(df)} samples")
print("Intent distribution:")
print(df['intent'].value_counts())

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Save to files
df.to_csv('models/enhanced_chatbot_dataset.csv', index=False)

# Also save as JSON for training
with open('models/enhanced_chatbot_dataset.json', 'w') as f:
    json.dump(dataset, f, indent=2)

print("Dataset saved successfully to models/ folder!")