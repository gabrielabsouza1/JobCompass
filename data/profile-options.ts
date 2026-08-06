export const workModeOptions = [
  { label: "Any", value: "any" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Onsite", value: "onsite" },
];

export const employmentTypeOptions = [
  { label: "Any", value: "any" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Casual", value: "casual" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

export const workRightsOptions = [
  { label: "Full-time work allowed", value: "full_time_allowed" },
  { label: "Part-time work allowed", value: "part_time_allowed" },
  { label: "Student visa limited hours", value: "student_limited_hours" },
  { label: "Working holiday visa", value: "working_holiday" },
  { label: "Sponsorship required", value: "sponsorship_required" },
  { label: "Citizen / Permanent resident", value: "citizen_or_pr" },
];

export function getOptionLabel(
  options: { label: string; value: string }[],
  value?: string
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "";
}