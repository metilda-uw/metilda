import React, { useContext, useState } from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import WordCard from "./WordCard";

import FirebaseContext from "../../Firebase/context";

import {fillMissingFieldsInChildDoc} from '../../Create/ImportUtils';

export default function CollectionView({
  words,
  selectedCollection,
  selectedCollectionUuid,
}) {
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

  let filteredWords = inputWords
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
  
    const filterWordsBasedOnVersion = () =>{
      const parentDocs = filteredWords.filter((word) =>{ return !word["data"].isAChildVersion});
      console.log("filtered words :: ", filteredWords);
      
      const result = [];

      parentDocs.forEach((parentDoc) => {
        
        // Filter objects by parent ID
        const childVersions = filteredWords.filter((word) =>  word["data"].parentDocumentId === parentDoc["id"]);

        // Sort filtered objects by createdAt in descending order
        childVersions.sort((a, b) => b["data"].createdAt - a["data"].createdAt);

        // Store the most recently created object for the parent ID
        if (childVersions.length > 0) {
          result.push(fillMissingFieldsInChildDoc(childVersions[0], parentDoc));
        }else{
          result.push(parentDoc);
        }
      });

      console.log("result words :: ", result);
      return result;
  }
  filteredWords = filterWordsBasedOnVersion();
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

      <div className="row collections-view-wordcards">
        <ul>
          {filteredWords.map((word: {}) => (
            <Link
              to={`/pitchartwizard/${selectedCollectionUuid}/${word["id"]}`}
              key={word["id"]}
            >
              <WordCard
                word={word}
                selectedCollectionUuid={selectedCollectionUuid}
                key={word["id"]}
              ></WordCard>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

CollectionView.propTypes = {
  words: PropTypes.array,
  selectedCollection: PropTypes.string,
  selectedCollectionUuid: PropTypes.string,
};
