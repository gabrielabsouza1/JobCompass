export function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Salary not listed";

  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} AUD`;
  }

  if (min) return `From $${min.toLocaleString()} AUD`;
  return `Up to $${max?.toLocaleString()} AUD`;
}

export function getWorkModeColor(workMode: string) {
  if (workMode === "Remote") return "bg-purple-50 text-purple-700";
  if (workMode === "Hybrid") return "bg-sky-50 text-sky-700";
  return "bg-emerald-50 text-emerald-700";
}

export function getRiskColor(risk: string) {
  if (risk === "High") return "bg-red-50 text-red-700";
  if (risk === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

export function getPostedAtValue(postedAt: string) {
  if (postedAt.includes("hour")) {
    return Number(postedAt.split(" ")[0]);
  }

  if (postedAt.includes("day")) {
    return Number(postedAt.split(" ")[0]) * 24;
  }

  return 999;
}