// ...existing code...
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // ensure handler runs and promise rejections are forwarded to Express
        Promise.resolve(requestHandler(req, res, next)).catch(next)
    }
}
export { asyncHandler }
// ...existing code...