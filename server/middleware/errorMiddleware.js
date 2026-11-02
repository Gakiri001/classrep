export function notFound(req, res) {
  res.status(404).json({ message: "Endpoint not found." });
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  if (status >= 500) console.error("Request failed.");
  res.status(status).json({
    message:
      status >= 500 ? "An unexpected server error occurred." : error.message,
  });
}
