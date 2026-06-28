import prisma from "../config/db.js";

export const createCampus = async (req, res) => {
  try {
    const campus = await prisma.campus.create({ data: req.body });
    res.status(201).json(campus);
  } catch (err) {
    res.status(500).json({ message: "Error creating campus" });
  }
};

export const getCampuses = async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      include: {
        staff: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(campuses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch campuses",
      error: error.message,
    });
  }
};
export const updateCampus = async (req, res) => {
  try {
    const { id } = req.params;

    const campus = await prisma.campus.update({
      where: { id: Number(id) },
      data: {
        name: req.body.name,
        code: req.body.code,
        location: req.body.location || null,
        contactPerson: req.body.contactPerson || null,
        contactNumber: req.body.contactNumber || null,
        email: req.body.email || null,
        status: req.body.status === true || req.body.status === "true",
        description: req.body.description || null,
      },
    });

    res.status(200).json(campus);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update campus",
      error: error.message,
    });
  }
};
export const updateCampusStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const campus = await prisma.campus.update({
      where: { id: Number(id) },
      data: {
        status: req.body.status === true || req.body.status === "true",
      },
    });

    res.status(200).json(campus);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update campus status",
      error: error.message,
    });
  }
};
export const deleteCampus = async (req, res) => {
  try {
    const { id } = req.params;
    const campusId = Number(id);

    const memberCount = await prisma.member.count({
      where: { campusId },
    });

    if (memberCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${memberCount} members are currently assigned to this campus.`,
      });
    }

    const staffCount = await prisma.staff.count({
      where: { campusId },
    });

    if (staffCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${staffCount} staff are currently assigned to this campus.`,
      });
    }

    await prisma.campus.delete({
      where: { id: campusId },
    });

    res.status(200).json({
      message: "Campus deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      message: "Failed to delete",
      error: error.message,
    });
  }
};
