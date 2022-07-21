import React, { useState } from "react";

const filterList = [
  "all",
  "two syllables",
  "three syllables",
  "four syllables",
  "over four syllables",
  "Earl Old Person",
];

export default function CollectionsFilter({ changeFilter }) {
  const [currentFilter, setCurrentFilter] = useState("all");

  const handleClick = (newFilter) => {
    setCurrentFilter(newFilter);
    changeFilter(newFilter);
  };

  return (
    <div className="collections-filter">
      Filter by:
      {filterList.map((f) => (
        <button
          key={f}
          onClick={() => handleClick(f)}
          className={currentFilter === f ? "active" : ""}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
