import { DMSVehicle } from "./dms";

export interface IntakeAnswers {
  desired_year?: string;
  desired_make?: string;
  desired_model?: string;
  body_style?: string;
  budget_min?: number;
  budget_max?: number;
  flexible_on_model?: boolean;
}

/**
 * Parse make + model from a vehicle's name like "2021 Honda Accord".
 * DMSVehicle may also expose `make`/`model` directly when AutoManager returns them.
 */
function getMakeModel(v: DMSVehicle): { make: string; model: string } {
  const anyV = v as DMSVehicle & { make?: string; model?: string; bodyType?: string };
  if (anyV.make && anyV.model) return { make: anyV.make, model: anyV.model };
  const parts = (v.name ?? "").trim().split(/\s+/);
  // First token is usually year; second is make; rest is model
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0])) {
    return { make: parts[1], model: parts.slice(2).join(" ") };
  }
  if (parts.length >= 2) {
    return { make: parts[0], model: parts.slice(1).join(" ") };
  }
  return { make: "", model: v.name ?? "" };
}

function getBodyType(v: DMSVehicle): string {
  return (v as DMSVehicle & { bodyType?: string }).bodyType ?? "";
}

/**
 * Smart-match algorithm: tries strict match first, then progressively loosens
 * filters until at least 3 vehicles are returned (or inventory is exhausted).
 */
export function smartMatchVehicles(
  vehicles: DMSVehicle[],
  answers: IntakeAnswers,
  limit = 3
): DMSVehicle[] {
  const inBudget = (v: DMSVehicle) => {
    const price = Number(v.price ?? 0);
    if (!price) return true;
    if (answers.budget_max && price > answers.budget_max) return false;
    if (answers.budget_min && price < answers.budget_min) return false;
    return true;
  };

  const eq = (a?: string | number | null, b?: string | null) =>
    a != null && b != null && String(a).toLowerCase().trim() === String(b).toLowerCase().trim();

  const yearNum = answers.desired_year ? parseInt(answers.desired_year, 10) : undefined;

  const tiers: Array<(v: DMSVehicle) => boolean> = [
    // 1. exact Y/M/M + budget
    (v) => {
      const { make, model } = getMakeModel(v);
      return (
        eq(v.year, answers.desired_year) &&
        eq(make, answers.desired_make) &&
        eq(model, answers.desired_model) &&
        inBudget(v)
      );
    },
    // 2. same make+model, year ±3
    (v) => {
      const { make, model } = getMakeModel(v);
      return (
        eq(make, answers.desired_make) &&
        eq(model, answers.desired_model) &&
        (!yearNum || Math.abs(Number(v.year) - yearNum) <= 3) &&
        inBudget(v)
      );
    },
    // 3. same make
    (v) => {
      const { make } = getMakeModel(v);
      return eq(make, answers.desired_make) && inBudget(v);
    },
    // 4. same body style
    (v) => answers.body_style != null && eq(getBodyType(v), answers.body_style) && inBudget(v),
    // 5. anything in budget
    (v) => inBudget(v),
    // 6. last resort
    () => true,
  ];

  const seen = new Set<number | string>();
  const results: DMSVehicle[] = [];

  for (const filter of tiers) {
    if (results.length >= limit) break;
    const matches = vehicles.filter(filter);
    for (const v of matches) {
      if (results.length >= limit) break;
      if (seen.has(v.id)) continue;
      seen.add(v.id);
      results.push(v);
    }
  }

  return results;
}
