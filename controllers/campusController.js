import prisma from "../config/db.js";

export const createCampus = async (req, res) => {
  try {
    const campus = await prisma.campus.create({
      data: req.body,
    });

    res.status(201).json(campus);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create campus",
      error: error.message,
    });
  }
};

export const getCampuses = async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      include: {
        campusStaffTypes: {
          include: {
            staffType: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
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
        location: req.body.location ?? null,
        status: req.body.status === true || req.body.status === "true",
        description: req.body.description ?? null,
      },
    });

    res.status(200).json(campus);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update campus",
      error: error.message,
    });
  }
};

export const deleteCampus = async (req, res) => {
  try {
    const campusId = Number(req.params.id);

    const memberCount = await prisma.member.count({
      where: { campusId },
    });

    if (memberCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${memberCount} members are assigned to this campus.`,
      });
    }

    // remove junction rows first
    await prisma.campusStaffType.deleteMany({
      where: { campusId },
    });

    await prisma.campus.delete({
      where: { id: campusId },
    });

    res.json({ message: "Campus deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete campus",
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

// Get all staff types
export const getStaffTypes = async (req, res) => {
  try {
    const staffTypes = await prisma.staffType.findMany({
      include: {
        _count: {
          select: {
            members: true,
            campusStaffTypes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(staffTypes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch staff types",
      error: error.message,
    });
  }
};

// Create a new staff type
export const createStaffType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Staff type name is required",
      });
    }

    const cleanName = name.trim().toUpperCase();

    const existing = await prisma.staffType.findUnique({
      where: {
        name: cleanName,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Staff type already exists.",
      });
    }

    const staffType = await prisma.staffType.create({
      data: {
        name: cleanName,
      },
    });

    res.status(201).json(staffType);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create staff type",
      error: error.message,
    });
  }
};

// Delete a staff type
export const deleteStaffType = async (req, res) => {
  try {
    const staffTypeId = Number(req.params.id);

    const memberCount = await prisma.member.count({
      where: { staffTypeId },
    });

    if (memberCount > 0) {
      return res.status(400).json({
        message: "Cannot delete: members assigned",
      });
    }

    await prisma.campusStaffType.deleteMany({
      where: { staffTypeId },
    });

    await prisma.staffType.delete({
      where: { id: staffTypeId },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};
export const updateStaffType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const updated = await prisma.staffType.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name.trim().toUpperCase(),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update staff type",
      error: error.message,
    });
  }
};
export const getCampusStaffTypes = async (req, res) => {
  try {
    const campusId = Number(req.params.campusId);

    const staffTypes = await prisma.campusStaffType.findMany({
      where: {
        campusId,
      },
      include: {
        staffType: true,
      },
      orderBy: {
        staffType: {
          name: "asc",
        },
      },
    });

    res.json(staffTypes.map((item) => item.staffType));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch campus staff types",
      error: error.message,
    });
  }
};
export const assignStaffTypeToCampus = async (req, res) => {
  try {
    const { campusId, staffTypeId } = req.body;

    if (!campusId || !staffTypeId) {
      return res.status(400).json({
        message: "campusId and staffTypeId are required",
      });
    }

    const assignment = await prisma.campusStaffType.create({
      data: {
        campusId: Number(campusId),
        staffTypeId: Number(staffTypeId),
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign staff type to campus",
      error: error.message,
    });
  }
};
