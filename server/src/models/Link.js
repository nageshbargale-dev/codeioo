import mongoose from 'mongoose';

const MAX_VISITS_KEPT = 200;

// Sequential "ticket numbers" — purely for the printed-ticket look.
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
export const Counter = mongoose.model('Counter', counterSchema);

export async function nextTicketNo() {
  const c = await Counter.findByIdAndUpdate(
    'ticket',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return c.seq;
}

const visitSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    referrer: { type: String, default: '' },
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    owner: { type: String, required: true, index: true },
    ticketNo: { type: Number, required: true },
    custom: { type: Boolean, default: false },
    clicks: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: null },
    visits: { type: [visitSchema], default: [] },
    // Soft delete: buried links live on in the Link Graveyard.
    buriedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

linkSchema.statics.recordVisit = function (code, referrer = '') {
  return this.findOneAndUpdate(
    { code, buriedAt: null },
    {
      $inc: { clicks: 1 },
      $set: { lastClickedAt: new Date() },
      $push: { visits: { $each: [{ referrer }], $slice: -MAX_VISITS_KEPT } },
    },
    { returnDocument: 'after' }
  );
};

linkSchema.methods.toPublic = function (baseUrl) {
  return {
    code: this.code,
    url: this.url,
    shortUrl: `${baseUrl}/${this.code}`,
    ticketNo: this.ticketNo,
    custom: this.custom,
    clicks: this.clicks,
    lastClickedAt: this.lastClickedAt,
    createdAt: this.createdAt,
    buriedAt: this.buriedAt,
    // Clicks per day for the last 7 days (oldest → newest), for the sparkline.
    week: weekHistogram(this.visits),
  };
};

const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

function weekHistogram(visits) {
  const days = Array(7).fill(0);
  const today = dayStart(new Date());
  for (const v of visits) {
    const daysAgo = Math.round((today - dayStart(v.at)) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) days[6 - daysAgo]++;
  }
  return days;
}

export const Link = mongoose.model('Link', linkSchema);
