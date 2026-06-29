import jwt from "jsonwebtoken";
import prisma from "../config/db.js"; // Adjust the path to your prisma client

// 1. Verifies the JWT token and fetches the fresh user
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: true,
      },
    });

    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 2. Checks if the user has the required role(s)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Validate req.user and roleId
    if (!req.user || !req.user.role?.name) {
      return res
        .status(403)
        .json({ message: "Access denied: Missing role information." });
    }

    // 2. Map role names to your database IDs
    // If your DB uses 1=admin, 2=staff, 3=member, this MUST match
    const userRole = req.user.role.name.toLowerCase();
    const allowedRoles = roles.map((role) => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.log(
        `Access Denied: User role ${req.user.role.name} not in allowed list [${allowedRoles}]`,
      );

      return res
        .status(403)
        .json({ message: "You do not have the required permission." });
    }

    next();
  };
};
