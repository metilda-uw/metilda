import React, { useContext, useState, useEffect } from "react";

import { Link } from "react-router-dom";

import WordCard from "./WordCard";

import FirebaseContext from "../../Firebase/context";

export default function CollectionView({ words, selectedCollection }) {
  const firebase = useContext(FirebaseContext);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [filter, setFilter] = useState("all");

  const inputWords = Object.values(words);

  const filterList = [
    "all",
    "two syllables",
    "three syllables",
    "four syllables",
    "over four syllables",
  ];

  const handleClick = (newFilter) => {
    setCurrentFilter(newFilter);
    changeFilter(newFilter);
  };

  const changeFilter = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredWords = inputWords
    ? inputWords.filter((word) => {
        switch (filter) {
          case "all":
            return true;
          case "two syllables":
            return word["data"].letters.length === 2;
          case "three syllables":
            return word["data"].letters.length === 3;
          case "four syllables":
            return word["data"].letters.length === 4;
          case "over four syllables":
            return word["data"].letters.length > 4;
          default:
            return true;
        }
      })
    : null;

  return (
    <div className="row">
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

      <div className="collections-view">
        <ul>
          {filteredWords.map((word) => (
            // <li key={word["id"]}>{word["id"]}</li>
            <Link to={`/collections/${word["id"]}`} key={word["id"]}>
              <WordCard
                word={word}
                selectedCollection={selectedCollection}
                key={word["id"]}
              ></WordCard>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
