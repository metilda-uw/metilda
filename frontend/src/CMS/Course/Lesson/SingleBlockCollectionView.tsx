import React, { useState } from "react";
import PropTypes from "prop-types";

import "../GeneralStyles.scss"
import BlockWordCard from "./BlockWordCard";
import { Link } from "react-router-dom";

export default function SingleBlockCollectionView({
  words,
  wordId,
  selectedCollectionUuid
}) {

  const inputWords = Object.values(words);

  const filteredWords = inputWords
    ? inputWords.filter((word) => {
        return word["id"] === wordId;
      })
    : null;
  return (
    <div className="page-collections-view">
      <div className="row collections-view-wordcards pitch-art-block-create-view">
        {/* <ul> */}
          {filteredWords.map((word: {}) => (
            <div key={word["id"]} style={{ 'margin': 'auto' }}>
              <div className="word-card">
                <Link
                  to={`/pitchartwizard/${selectedCollectionUuid}/${word["id"]}`}
                  key={word["id"]}
                >
                  <BlockWordCard
                      word={word}
                      selectedCollectionUuid={selectedCollectionUuid}
                      key={word["id"]}
                    ></BlockWordCard>
                </Link>
              </div>
            </div>

          ))}
        {/* </ul> */}
      </div>
    </div>
  );
}

SingleBlockCollectionView.propTypes = {
  words: PropTypes.array,
  selectedCollectionUuid: PropTypes.string,
};
