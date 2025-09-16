import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";
import { TenantProfile } from "../../models/TenantProfile.js";
import { House } from "../../models/House.js";



// POST /api/tenantProfiles/createTenant
export const createTenant = async (req, res) => {
  try {
    const { name, role, qatarId, contact, assignedHouseId, startDate } = req.body;

    if (!name || !role || !qatarId) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
      });

      await tenantProfile.save();

      // Mark house occupied
      if (assignedHouseId) {
        const house = await House.findById(assignedHouseId);
        if (!house) {
          return res.status(404).json({ message: "House not found" });
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

    // 1. Mark tenant as deleted
    await User.findByIdAndUpdate(id, { isDeleted: true });

    // 2. Mark tenant profile as inactive
    await TenantProfile.findOneAndUpdate(
      { userId: id },
      { isActive: false, endDate: new Date() } // <-- set endDate
    );

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
    const tenants = await User.find({ 
      role: "tenant", 
      isDeleted: { $ne: true } // exclude soft-deleted users
    })
    .select("-passwordHash")
    .lean();

    const profiles = await TenantProfile.find()
      .populate({
        path: "assignedHouseId",
        populate: {
          path: "villaId", // also fetch villa info
          select: "name",  // only villa name
        },
      })
      .lean();

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


// Update tenant profile
export const updateTenantProfile = async (req, res) => {
  try {
    const tenantId = req.params.id; // userId
    const { qatarId, contact } = req.body;

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
    

    // 3. Update Qatar ID
    if (qatarId) {
      tenantProfile.qatarId = qatarId;
      user.qatarId = qatarId;
    }

    // 4. If contact changed
    if (contact && contact !== tenantProfile.contact) {
      tenantProfile.contact = contact;

      const newEmail = `${contact}@gmail.com`;

      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser && existingUser._id.toString() !== tenantId) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = newEmail;

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(contact, salt);
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
