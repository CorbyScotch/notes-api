const jwt = require("jsonwebtoken");

// auth middleware
const protect = (request, response, next) => {
  const authHeader = request.headers["authorization"];

  if (!authHeader) {
    return response.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return response.status(401).json({ message: "Invalid or expired token" });
    }

    request.userId = decoded.userId;
    next();
  });
};

module.exports = protect;
