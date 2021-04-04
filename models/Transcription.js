const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TranscriptionSchema = Schema({
  file: String,
  transcription: [
    {
      word: String,
      start: Number,
      end: Number,
    },
  ],
});
TranscriptionSchema.set("timestamps", true);

const Transcription = mongoose.model("Transcription", TranscriptionSchema);

module.exports = Transcription;