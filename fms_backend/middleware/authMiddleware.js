const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = null;

  // Get token from cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Or from Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = protect;
