import { RU, Strings, makeBookingReel } from "../v11/Video11";
import { F, VO } from "./timeline";

// Video 12 - EN version of Video 11 (same scenes, EN strings and voice timings)
const EN: Strings = {
  ...RU,
  booking: "Studio B2 · 3 nights",
  confirmed: "Confirmed",
  database: "database",
  dates: "Nov 12 → 15 · 2 guests",
  free: "free",
  taken: "taken",
  apiData: ["rooms", "dates", "prices"],
  ddpNote: "calendar and rates",
  restNote: "booking creation",
  server: "Server",
  ratePlan: "rate plan \"Сайт almatyda.kz\"",
  nights: "3 nights × 15,000 ₸",
  total: "45,000 ₸",
  request: "Request from the browser",
  ignored: "the server doesn't accept a price from the browser",
  card: "Booking payment",
  linkLives: "payment link lives",
  min: "min",
  authorized: "authorized, not charged",
  dateCheck: "dates still free?",
  okTitle: "Free",
  okNote: "booking in ApartX and capture",
  noTitle: "Taken",
  noNote: "authorization cancelled",
  holds: [
    { img: "apartx", note: "bookings and calendar" },
    { img: "plexy", note: "payments" },
  ],
  zero: "databases",
  tests: "tests",
  headlines: (F) => [
    { from: -40, text: "Nobody talks about this: booking with no database" },
    { from: F.siteIn + 6, text: "Booking for AlmatyDa" },
    { from: F.ddpIn + 6, text: "ApartX API: DDP and REST\u00a0v3" },
    { from: F.priceIn + 6, text: "Only the server sets the price" },
    { from: F.payIn + 6, text: "Plexy API: authorize first" },
    { from: F.hookIn + 6, text: "Webhook: check, then capture" },
    { from: F.endIn + 6, text: "Where the state lives" },
  ],
};

export const Video12 = makeBookingReel(F, VO, EN);
