import jwt from "jsonwebtoken";

// 1. Verifies the JWT token
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming your JWT payload includes the user's role
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 2. Checks if the user has the required role(s)
// Usage: router.post('/register', protect, restrictTo('admin'), controller);
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log("Logged-in user details:", req.user);
    // console.log("Required roles:", roles);

    // req.user must be populated by the 'protect' middleware first
    const userRole = req.user.role ? req.user.role.toLowerCase() : "";
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message:
          "You do not have the required permission to perform this action",
      });
    }
    next();
  };
};
