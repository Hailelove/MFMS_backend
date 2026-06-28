import prisma from "../config/db.js";

export const registerStaff = async (req, res) => {
  //   console.log("RECEIVED PAYLOAD:", req.body);
  let { role = "", campusId } = req.body;

  try {
    // 1. Normalize the input:
    // Convert to uppercase and remove words like 'STAFF' to match your DB
    const normalizedRole = role
      .toString()
      .toUpperCase()
      .replace(" STAFF", "")
      .trim();

    // 2. Validation mapping
    // Map various inputs to your two allowed database values
    const roleMapping = {
      ADMIN: "ADMIN",
      ADMINISTRATIVE: "ADMIN",
      ACADEMIC: "ACADEMIC",
      LECTURER: "ACADEMIC",
    };

    const finalRole = roleMapping[normalizedRole];

    if (!finalRole) {
      return res.status(400).json({
        message: "Invalid role. Please select 'Admin' or 'Academic'.",
      });
    }

    // 3. Create the record with the normalized value
    const newStaff = await prisma.staff.create({
      data: {
        role: finalRole,
        campusId: Number(campusId),
      },
    });

    res.status(201).json(newStaff);
  } catch (error) {
    console.error("SERVER ERROR:", error); // <-- THIS IS THE KEY
    res
      .status(500)
      .json({ message: error.message || "Failed to assign staff role" });
  }
};
