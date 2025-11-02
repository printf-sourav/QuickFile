// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  const success = false;
  const errors = err.errors || [];

  // Log error for debugging
  console.error('❌ Error occurred:', {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    errorName: err.name
  });

  // Send error response matching apiResponse format
  return res.status(statusCode).json({
    statusCode,
    success,
    message,
    errors,
    data: null
  });
};

export { errorHandler };
