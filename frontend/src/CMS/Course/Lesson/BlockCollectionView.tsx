import React, { useState } from "react";
import PropTypes from "prop-types";

import "../GeneralStyles.scss"
import BlockWordCard from "./BlockWordCard";

export default function BlockCollectionView({
  words,
  selectedCollection,
  selectedCollectionUuid,
  setPitchArt
}) {

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
  console.log(filteredWords[0])
  return (
    <div className="page-collections-view">
      <div className="page-collections-view-filter">
        <p>Filter the {selectedCollection} collection by:</p>
        {filterList.map((f) => (
          <button
            key={f}
            onClick={() => handleClick(f)}
            className={
              currentFilter === f
                ? "active collections-filter btn waves-light globalbtn"
                : "collections-filter btn waves-light globalbtn"
            }
          >
            {f}
          </button>
        ))}
        <p>Currently showing {filteredWords.length} items.</p>
      </div>

      <div className="row collections-view-wordcards pitch-art-block-create-view">
        {/* <ul> */}
          {filteredWords.map((word: {}) => (
            <div key={word["id"]}>
              <div className="lesson-word-card">
                <label htmlFor={word["id"]}>
                  <BlockWordCard
                      word={word}
                      selectedCollectionUuid={selectedCollectionUuid}
                      key={word["id"]}
                    ></BlockWordCard>
                </label>
              </div>

              <div><input id={word["id"]} style={{ 'position': 'unset', 'opacity': 'unset', 'pointerEvents': 'unset', 'margin': 'unset' }} name='pitch-art' type='radio' onClick={() => setPitchArt(selectedCollectionUuid+' '+word["id"])}></input></div>
            </div>

          ))}
        {/* </ul> */}
      </div>
    </div>
  );
}

BlockCollectionView.propTypes = {
  words: PropTypes.array,
  selectedCollection: PropTypes.string,
  selectedCollectionUuid: PropTypes.string,
};
