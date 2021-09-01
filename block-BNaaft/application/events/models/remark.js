const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const remarksSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
  },
  { timestamps: true }
);

var Remark = mongoose.model('Remark', remarksSchema);
module.exports = Remark;
