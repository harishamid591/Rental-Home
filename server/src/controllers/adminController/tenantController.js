import bcrypt from "bcryptjs";
import Joi from "joi";
import { User } from "../../models/User.js";
import { TenantProfile } from "../../models/TenantProfile.js";
import { House } from "../../models/House.js";


const createSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string().valid("tenant", "admin").required(),
  qatarId: Joi.string().required(),
  contact: Joi.string().required(),
  assignedHouseId: Joi.string().allow(null, ""),
  startDate: Joi.date().optional(),
});

// POST /api/tenantProfiles/createTenant
export const createTenant = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { name, role, qatarId, contact, assignedHouseId, startDate } = value;

    const email = `${contact}@gmail.com`;
    const password = contact; 

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({ name, email, passwordHash, role });
    await newUser.save();

    let tenantProfile = null;

    if (role === "tenant") {
      tenantProfile = new TenantProfile({
        userId: newUser._id,
        qatarId,
        contact,
        assignedHouseId: assignedHouseId || null,
        startDate: startDate || new Date(),
        isActive: true,
      });
      await tenantProfile.save();

      // Mark house occupied
      if (assignedHouseId) {
        const house = await House.findById(assignedHouseId);
        if (!house || house.isDeleted) {
          return res.status(404).json({ success: false, message: "House not found" });
        }
        if (house.currentTenantUserId) {
          return res.status(400).json({ message: "House already occupied" });
        }
        house.currentTenantUserId = newUser._id;
        await house.save();
      }
    }

    // ✅ Re-fetch tenant with populated profile (same format as getTenants)
    const populatedProfile = await TenantProfile.findOne({ userId: newUser._id })
      .populate({
        path: "assignedHouseId",
        populate: {
          path: "villaId",
          select: "name",
        },
      })
      .lean();

    const tenantData = {
      ...newUser.toObject(),
      passwordHash: undefined, // hide passwordHash
      profile: populatedProfile || {},
    };

    res.status(201).json(tenantData);
  } catch (err) {
    console.error("Create tenant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isDeleted = true;
    await user.save();

    // 1. Mark tenant as deleted
    await TenantProfile.findOneAndUpdate({ userId: id }, { isActive: false, endDate: new Date() });

    // 3. Free up house
    const house = await House.findOne({ currentTenantUserId: id });
    if (house) {
      house.currentTenantUserId = null;
      await house.save(); // ✅ pre-save hook runs → isOccupied = false
    }

    res.json({ message: "Tenant removed from active records successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

  
export const getTenants = async (req, res) => {
  try {
    // Find tenants and join their profile + house + villa in one go
    const tenants = await User.find({ role: "tenant", isDeleted: { $ne: true } }).select("-passwordHash").lean();

    const profiles = await TenantProfile.find({}).populate({
      path: "assignedHouseId",
      populate: { path: "villaId", select: "name" },
    }).lean();

    // Merge users + profiles
    const tenantData = tenants.map((tenant) => {
      const profile = profiles.find(
        (p) => p.userId.toString() === tenant._id.toString()
      );
      return {
        ...tenant,
        profile: profile || {},
      };
    });


    res.json(tenantData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

const updateSchema = Joi.object({
  qatarId: Joi.string().optional(),
  contact: Joi.string().optional(),
});

// Update tenant profile
export const updateTenantProfile = async (req, res) => {
  try {
    const tenantId = req.params.id; // userId
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    // 1. Find Tenant Profile
    const tenantProfile = await TenantProfile.findOne({ userId: tenantId });
    if (!tenantProfile) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    // 2. Find User
    const user = await User.findById(tenantId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted || tenantProfile.isActive === false) {
      return res.status(400).json({ message: "Tenant is inactive/deleted" });
    }
    
    if (value.qatarId) {
      tenantProfile.qatarId = value.qatarId;
      user.qatarId = value.qatarId;
    }

    // 4. If contact changed
    
    if (value.contact && value.contact !== tenantProfile.contact) {
      tenantProfile.contact = value.contact;
      const newEmail = `${value.contact}@gmail.com`;
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser && existingUser._id.toString() !== tenantId) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      user.email = newEmail;
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(value.contact, salt);
    }

    await tenantProfile.save();
    await user.save();

    // ✅ Re-fetch with populated profile
    const populatedProfile = await TenantProfile.findOne({ userId: tenantId })
      .populate({
        path: "assignedHouseId",
        populate: {
          path: "villaId",
          select: "name",
        },
      })
      .lean();

    const tenantData = {
      ...user.toObject(),
      passwordHash: undefined,
      profile: populatedProfile || {},
    };

    res.json(tenantData);
  } catch (err) {
    console.error("Update tenant error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
