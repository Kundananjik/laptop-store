function getSessionId(req) {
  const headerValue = req.headers["x-session-id"];
  const sessionId = typeof headerValue === "string" ? headerValue.trim() : "";

  if (!sessionId) {
    const error = new Error("x-session-id header is required");
    error.statusCode = 400;
    throw error;
  }

  return sessionId;
}

module.exports = {
  getSessionId,
};
