import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quick Bite API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Quick Bite food delivery MERN web application. Includes User Management, Restaurant, Food, Cart, Order placement, Payment verification, and AI Chatbot integrations.',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: <token_value>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the user' },
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', description: 'Unique user email address' },
            password: { type: 'string', description: 'Hashed password' },
            cartData: { type: 'object', description: 'Key-value mapping of food item ID to quantity' },
          },
        },
        Restaurant: {
          type: 'object',
          required: ['name', 'address', 'phone'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the restaurant' },
            name: { type: 'string', description: 'Name of the restaurant' },
            address: { type: 'string', description: 'Restaurant location address' },
            phone: { type: 'string', description: 'Contact phone number' },
          },
        },
        Food: {
          type: 'object',
          required: ['name', 'description', 'price', 'category', 'restaurantId'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the food item' },
            name: { type: 'string', description: 'Name of the food item' },
            description: { type: 'string', description: 'Description of ingredients and preparation' },
            price: { type: 'number', description: 'Price of food item in INR' },
            category: { type: 'string', description: 'Food category (e.g. Italian, Chinese)' },
            restaurantId: { type: 'string', description: 'Associated restaurant ID' },
          },
        },
        Order: {
          type: 'object',
          required: ['userId', 'items', 'amount', 'address'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the order' },
            userId: { type: 'string', description: 'ID of the ordering customer' },
            items: { 
              type: 'array', 
              items: { type: 'object' },
              description: 'Array of food items with metadata and quantity'
            },
            amount: { type: 'number', description: 'Total price including delivery charges' },
            address: { 
              type: 'object', 
              description: 'Delivery address details object'
            },
            status: { type: 'string', default: 'Food Processing', description: 'Order processing status' },
            date: { type: 'string', format: 'date-time', description: 'Order creation timestamp' },
            payment: { type: 'boolean', default: false, description: 'Payment verification status' },
          },
        },
        ChatSession: {
          type: 'object',
          required: ['sessionId', 'userType'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the session' },
            sessionId: { type: 'string', description: 'Unique chat session ID' },
            userId: { type: 'string', description: 'User ID or guest ID' },
            userType: { type: 'string', enum: ['admin', 'customer'], description: 'Role of the session owner' },
            context: { type: 'object', description: 'Metadata context, previous intents list, etc.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ChatMessage: {
          type: 'object',
          required: ['sessionId', 'message', 'sender'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated unique ID of the message' },
            sessionId: { type: 'string', description: 'Chat session association' },
            message: { type: 'string', description: 'Content of the message text' },
            sender: { type: 'string', enum: ['user', 'bot'], description: 'Sender role' },
            intent: { type: 'string', description: 'Classified AI intent identifier' },
            confidence: { type: 'number', description: 'Confidence score of prediction' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./Routes/*.js'], // Relative to execution path (process.cwd() is backend)
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
