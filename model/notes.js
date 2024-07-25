const mongoose = require("mongoose");
const { Schema } = mongoose;
const notesSchema = new Schema(
  {
    content: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { versionKey: false }
);

const Note = mongoose.models.Note || mongoose.model("Note", notesSchema);

// let Note = mongoose.models.Note;

// if (!Note) {
//   Note = mongoose - model("Note", notesSchema);
// }

module.exports = Note;
