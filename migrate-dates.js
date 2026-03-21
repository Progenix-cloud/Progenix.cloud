const mongoose = require("mongoose");
const { connectToDB } = require("./lib/db");

// Models that need migration (those with createdDate/updatedDate)
const MODELS_TO_MIGRATE = [
  "Project",
  "Team",
  "Meeting",
  "Task",
  "Attendance",
  "TaskTemplate",
  "Risk",
  "KnowledgeBase",
  "Lead",
];

async function migrateDates() {
  await connectToDB();

  for (const modelName of MODELS_TO_MIGRATE) {
    const Model = mongoose.models[modelName];
    if (!Model) continue;

    console.log(`Migrating ${modelName}...`);

    const docsWithOldDates = await Model.find({
      $or: [
        { createdDate: { $exists: true, $ne: null } },
        { updatedDate: { $exists: true, $ne: null } },
      ],
    });

    let migrated = 0;
    for (const doc of docsWithOldDates) {
      const updates = {};
      const fallbackCreated =
        doc.createdDate ||
        doc.dateAdded ||
        doc.issuedDate ||
        doc.submittedDate ||
        doc.timestamp ||
        doc.date;
      const fallbackUpdated =
        doc.updatedDate || doc.updatedAt || doc.createdAt || fallbackCreated;

      if (fallbackCreated && !doc.createdAt) {
        updates.createdAt = fallbackCreated;
      }
      if (fallbackUpdated && !doc.updatedAt) {
        updates.updatedAt = fallbackUpdated;
      }

      if (Object.keys(updates).length > 0) {
        await Model.updateOne({ _id: doc._id }, { $set: updates });
        migrated++;
      }
    }

    console.log(`  Migrated ${migrated} documents in ${modelName}`);
  }

  console.log("Migration complete!");
  process.exit(0);
}

migrateDates().catch(console.error);
