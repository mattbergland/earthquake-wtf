"use client";

import { sportLabels, sportEmoji } from "@/lib/venues-data";

const allSports = ["all", "basketball", "soccer", "tennis", "volleyball", "pickleball"] as const;

export default function SportFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (sport: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {allSports.map((sport) => (
        <button
          key={sport}
          onClick={() => onChange(sport)}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-150 ${
            selected === sport
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {sport === "all" ? "All Sports" : `${sportEmoji[sport]} ${sportLabels[sport]}`}
        </button>
      ))}
    </div>
  );
}
