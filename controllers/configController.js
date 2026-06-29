import prisma from "../config/db.js";

// Update system configuration
export const updateSystemConfiguration = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    // We assume the configuration has an ID of 1
    const updatedConfig = await prisma.systemConfiguration.update({
      where: { id: 1 },
      data: {
        ...data,
        updatedById: userId,
      },
    });

    // Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_SYSTEM_CONFIGURATION",
        tableName: "SystemConfiguration",
        recordId: 1,
        newValue: JSON.stringify(data),
      },
    });

    res.status(200).json({
      message: "System configuration updated successfully",
      config: updatedConfig,
    });
  } catch (error) {
    console.error("Config Update Error:", error);
    res.status(500).json({ message: "Failed to update configuration" });
  }
};
