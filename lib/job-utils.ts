export function formatSalary(min?: number, max?: number) {
  const formatAmount = (value: number) =>
    value.toLocaleString("en-AU", {
      maximumFractionDigits: 0,
    });

  if (!min && !max) return "Salary not listed";

  if (min && max) {
    return `$${formatAmount(min)} - $${formatAmount(max)} AUD`;
  }

  if (min) return `From $${formatAmount(min)} AUD`;
  return `Up to $${formatAmount(max ?? 0)} AUD`;
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
  const value = postedAt.trim();

  if (!value) {
    return 0;
  }

  if (value === "Recently") {
    return Date.now();
  }

  const hoursMatch = value.match(/(\d+)\s*hours?\s*ago/i);

  if (hoursMatch) {
    const hours = Number(hoursMatch[1]);

    return Date.now() - hours * 60 * 60 * 1000;
  }

  const daysMatch = value.match(/(\d+)\s*days?\s*ago/i);

  if (daysMatch) {
    const days = Number(daysMatch[1]);

    return Date.now() - days * 24 * 60 * 60 * 1000;
  }

  const slashParts = value.split("/");

  if (slashParts.length === 3) {
    const day = Number(slashParts[0]);
    const month = Number(slashParts[1]);
    const year = Number(slashParts[2]);

    if (day && month && year) {
      return new Date(year, month - 1, day).getTime();
    }
  }

  const parsed = Date.parse(value);

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

export function formatPostedAt(postedAt: string) {
  const value = postedAt.trim();

  if (!value) {
    return "Recently";
  }

  if (value === "Recently" || /ago$/i.test(value)) {
    return value;
  }

  const timestamp = getPostedAtValue(value);

  if (timestamp > 0) {
    return new Date(timestamp).toLocaleDateString("en-AU");
  }

  return value;
}
