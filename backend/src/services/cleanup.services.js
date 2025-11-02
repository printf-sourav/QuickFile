import cron from "node-cron";
import { File } from "../models/file.model.js";
import { v2 as cloudinary } from "cloudinary";

const startCleanupJob = () => {
  console.log("🧹 Cleanup service started...");

  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    console.log("🕒 Running hourly cleanup job...");

    const expiredFiles = await File.find({ expiresAt: { $lte: new Date() } });
    for (const file of expiredFiles) {
      try {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
        await File.findByIdAndDelete(file._id);
        console.log(`✅ Deleted expired file: ${file.filename}`);
      } catch (err) {
        console.error("❌ Error deleting expired file:", err.message);
      }
    }
  });
};

export {startCleanupJob}
