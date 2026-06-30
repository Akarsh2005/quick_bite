export class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log trace for 500 errors
    if (statusCode === 500) {
        console.error(`[API Error 500] ${req.method} ${req.url}:`, err);
    } else {
        console.warn(`[API Warning ${statusCode}] ${req.method} ${req.url}: ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};
