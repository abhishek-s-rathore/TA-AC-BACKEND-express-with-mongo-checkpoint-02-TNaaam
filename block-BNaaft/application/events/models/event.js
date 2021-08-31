const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsSchema = new Schema(
  {
    title: { type: String, required: true },
    summery: { type: String, required: true },
    host: { type: String, required: true },
    location: { type: String, required: true },
    categories: Array,
    start_date: { type: Date },
    end_date: { type: Date },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    cover: { type: String },
    remarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Remark' }],
  },
  { timestamps: true }
);

var Event = mongoose.model('Event', eventsSchema);
module.exports = Event;
