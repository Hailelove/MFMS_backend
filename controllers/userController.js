// controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user and include their role and member profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        member: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is suspended. Please contact the administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Update last login (non-blocking)
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })
      .catch((err) => console.error("Failed to update lastLogin:", err));

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Format response for the React frontend
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.member?.fullName || user.username,
      role: user.role.name.toLowerCase(), // frontend expects 'admin' or 'member'
    };

    res.status(200).json({
      token,
      ...userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
};
export const registerMember = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      employeeId,
      phone,
      campusId,
      department,
      officeUnit,
      position,
      monthlySalary,
    } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.member.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create Member in Database
    const newMember = await prisma.member.create({
      data: {
        fullName,
        email,
        // password: hashedPassword, // Store securely
        employeeId,
        phone,
        campusId: parseInt(campusId),
        department,
        officeUnit,
        position,
        monthlySalary: parseFloat(monthlySalary),
        membershipNo: `MEM-${Date.now()}`, // Generate a unique ID
      },
    });

    res.status(201).json({
      message: "Member registered successfully",
      member: newMember,
    });
  } catch (error) {
    console.error("DEBUG: Registration failed:", error);

    res.status(500).json({ message: "Server error during registration" });
    details: error.message;
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: { user: true },
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};
