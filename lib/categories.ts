export const CATEGORIES = [
  { id: "food", label: "อาหารและเครื่องดื่ม", color: "#2dd4a7" },
  { id: "transport", label: "เดินทาง", color: "#38bdf8" },
  { id: "housing", label: "ที่พักและค่าเช่า", color: "#818cf8" },
  { id: "bills", label: "ค่าน้ำ ค่าไฟ และบิล", color: "#fbbf24" },
  { id: "shopping", label: "ช้อปปิ้ง", color: "#f472b6" },
  { id: "health", label: "สุขภาพ", color: "#fb7185" },
  { id: "entertainment", label: "บันเทิง", color: "#a78bfa" },
  { id: "education", label: "การศึกษา", color: "#34d399" },
  { id: "other", label: "อื่น ๆ", color: "#94a3b8" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export function categoryInfo(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
