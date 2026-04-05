// lib/mongodb/init-db.ts

import mongoose from "mongoose";
import User from "@/models/user_model";
import Building from "@/models/building_model";
import Unit from "@/models/unit_allocation_modal";
import PaymentPlan from "@/models/payment_model";
import Inquiry from "@/models/inquiry_model";
import GeneralImageModel from "@/models/generalGallery";
import dbConnect from "./connection";

/* ---------------- CREATE ADMIN ---------------- */

async function createInitialAdmin() {
  try {
    const adminExists = await User.findOne({ name: "admin" });

    if (!adminExists) {
      const password = "123456789";

      await User.create({
        name: "admin",
        password,
      });

      console.log("✅ Initial admin user created");
    } else {
      console.log("ℹ️ Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error creating initial admin:", error);
  }
}

/* ---------------- CREATE COLLECTIONS ---------------- */

async function createCollections() {
  const collections = [
    { name: "users", model: User },
    { name: "phases", model: Building },
    { name: "units", model: Unit },
    { name: "paymentPlans", model: PaymentPlan },
    { name: "inquiries", model: Inquiry },
    { name: "images_data", model: GeneralImageModel },
  ];

  for (const collection of collections) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const exists = await mongoose.connection.db
        .listCollections({ name: collection.name })
        .next();

      if (!exists) {
        await mongoose.connection.createCollection(collection.name);
        console.log(`✅ Created collection: ${collection.name}`);
      } else {
        console.log(`ℹ️ Collection already exists: ${collection.name}`);
      }
    } catch (error) {
      console.error(
        `❌ Error creating collection ${collection.name}:`,
        error,
      );
    }
  }
}

/* ---------------- CREATE INDEXES ---------------- */

async function createIndexes() {
  try {
    await User.collection.createIndex({ name: 1 }, { unique: true });

    await Building.collection.createIndex({
      "location.coordinates": "2dsphere",
    });

    await Building.collection.createIndex(
      { name: 1 },
      { unique: true, sparse: true },
    );

    await Unit.collection.createIndex({
      "location.coordinates": "2dsphere",
    });

    await Unit.collection.createIndex(
      { unitNumber: 1 },
      { unique: true },
    );

    await Unit.collection.createIndex({ building: 1 });
    await Unit.collection.createIndex({ status: 1 });

    await PaymentPlan.collection.createIndex({ unit: 1 });
    await PaymentPlan.collection.createIndex({ status: 1 });

    await Inquiry.collection.createIndex({ status: 1 });
    await Inquiry.collection.createIndex({ createdAt: 1 });

    console.log("✅ All indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  }
}

/* ---------------- INITIALIZE DATABASE ---------------- */

export async function initializeDatabase() {
  try {
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    await createCollections();
    console.log("✅ Collections checked/created");

    await createIndexes();
    console.log("✅ Indexes created");

    await createInitialAdmin();
    console.log("✅ Admin setup completed");

    console.log("🎉 Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

/* ---------------- VALIDATE DATABASE ---------------- */

export async function validateDatabaseState() {
  try {
    const validations = [
      { model: User, name: "Users" },
      { model: Building, name: "Phases" },
      { model: Unit, name: "Units" },
      { model: PaymentPlan, name: "Payment Plans" },
      { model: Inquiry, name: "Inquiries" },
      { model: GeneralImageModel, name: "General Images" },
    ];

    console.log("\n📊 Database State Validation");
    console.log("-----------------------------");

    for (const validation of validations) {
      const count = await validation.model.countDocuments();
      console.log(`${validation.name}: ${count} documents`);
    }

    const adminExists = await User.findOne({ name: "admin" });
    console.log(`Admin user exists: ${!!adminExists}`);

    const indexes = await User.collection.indexes();
    const hasIndex = indexes.some((index) => index.name === "name_1");

    console.log(`Index name_1 exists: ${hasIndex}`);

    console.log("-----------------------------\n");
  } catch (error) {
    console.error("❌ Error validating database state:", error);
  }
}

/* ---------------- RUN SCRIPT ---------------- */

async function run() {
  try {
    await initializeDatabase();
    await validateDatabaseState();

    console.log("✅ Database setup finished");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();