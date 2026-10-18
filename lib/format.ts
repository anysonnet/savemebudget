const TZ = "Asia/Bangkok";

const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

/** Amounts are stored as integer satang; display as Thai baht. */
export function formatBaht(satang: number): string {
  return baht.format(satang / 100);
}

const shortDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeZone: TZ,
});

const monthYear = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

/** Anchor a 'YYYY-MM-DD' calendar date at noon UTC (19:00 in Bangkok) so the Bangkok date never shifts. */
function anchor(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function formatDate(isoDate: string): string {
  return shortDate.format(anchor(isoDate));
}

export function formatMonth(isoDate: string): string {
  return monthYear.format(anchor(isoDate));
}

/** Today's calendar date in Asia/Bangkok as 'YYYY-MM-DD'. */
export function bangkokToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** [start, next) of the month containing `isoDate`. */
export function monthRange(isoDate: string): { start: string; next: string } {
  const [y, m] = isoDate.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return { start: `${y}-${pad(m)}-01`, next: `${ny}-${pad(nm)}-01` };
}
