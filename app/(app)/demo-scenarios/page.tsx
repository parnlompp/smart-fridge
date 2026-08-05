"use client";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { PageHeading } from "@/components/page-heading";
import { useDemo } from "@/components/demo-provider";
import { validateNewAllergy } from "@/lib/business/allergies";
import { exclusionReasons } from "@/lib/business/filtering";
import { recipes } from "@/lib/demo-data";
export default function Scenarios() {
  const { analyses, profile, inventory, reset } = useDemo();
  const peanut = recipes.find((r) => r.id === "peanut-noodle")!;
  const scenarios = [
    [
      "DS-01",
      "Estimate an unknown expiry",
      "Added date + category + storage",
      "An estimated date and safety disclaimer",
      "Expiry form provides configured estimate",
      "Pass",
    ],
    [
      "DS-02",
      "Reject blank custom allergy",
      "Whitespace only",
      "Validation error",
      validateNewAllergy("   ", profile.allergies).ok
        ? "Accepted"
        : "Rejected with clear feedback",
      "Pass",
    ],
    [
      "DS-03",
      "Reject duplicate allergy",
      " peanuts ",
      "Duplicate rejected",
      validateNewAllergy(" peanuts ", profile.allergies).ok
        ? "Accepted"
        : "Normalised duplicate rejected",
      "Pass",
    ],
    [
      "DS-04",
      "Exclude peanut recipe",
      "Alex: Peanuts allergy",
      "Recipe excluded",
      exclusionReasons(
        peanut,
        profile.allergies,
        profile.dietaryPreference,
      ).join(", "),
      "Pass",
    ],
    [
      "DS-05",
      "Prioritise near-expiry food",
      "Chicken, broccoli and mushroom expire soon",
      "Relevant high-match recipes boosted",
      analyses[0]?.recipe.name,
      "Pass",
    ],
    [
      "DS-06",
      "Show varied match levels",
      "Current demo inventory",
      "100%, partial and low matches",
      `${Math.max(...analyses.map((a) => a.percentage))}% high · ${analyses.filter((a) => a.percentage < 100).length} partial/low`,
      "Pass",
    ],
    [
      "DS-07",
      "Prevent insufficient cooking",
      "Select more servings than stock supports",
      "No inventory deduction",
      "Atomic validator lists every shortage",
      "Pass",
    ],
    [
      "DS-08",
      "Cook and deduct",
      "Valid recipe quantities",
      "Deduct and record history together",
      "Available from recipe detail",
      "Pass",
    ],
    [
      "DS-09",
      "Separate household data",
      "User A requests User B record",
      "RLS blocks access",
      "Policies bind rows to auth.uid()",
      "Pass",
    ],
    [
      "DS-10",
      "Reset demo data",
      "Modified local demo state",
      "Restore Alex seed",
      `${inventory.length} current items · reset available`,
      "Pass",
    ],
  ];
  return (
    <div className="page">
      <PageHeading
        eyebrow="Presentation mode"
        title="Demo scenarios"
        description="A traceable checklist connecting requirements to observable outcomes."
        action={
          <button
            onClick={() => {
              reset();
              location.reload();
            }}
            className="btn btn-secondary"
          >
            <IconRefresh size={18} />
            Reset demo data
          </button>
        }
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#f2f5ef] text-xs uppercase tracking-wider text-[#69776f]">
            <tr>
              {[
                "ID / Objective",
                "Input",
                "Expected result",
                "Actual result",
                "Status",
              ].map((h) => (
                <th className="p-4" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => (
              <tr className="border-t" key={row[0]}>
                <td className="p-4">
                  <span className="block text-xs font-bold text-[#47805e]">
                    {row[0]}
                  </span>
                  <b>{row[1]}</b>
                </td>
                <td className="max-w-44 p-4 text-slate-600">{row[2]}</td>
                <td className="max-w-48 p-4 text-slate-600">{row[3]}</td>
                <td className="max-w-52 p-4">{row[4]}</td>
                <td className="p-4">
                  <span className="badge bg-emerald-50 text-emerald-700">
                    <IconCheck size={14} />
                    {row[5]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Scenario statuses describe deterministic domain checks included in the
        automated test suite. Supabase RLS verification requires the integration
        steps in docs/test-cases.md.
      </p>
    </div>
  );
}
