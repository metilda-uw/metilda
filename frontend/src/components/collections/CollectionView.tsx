import React, { useContext, useState, useEffect } from "react";

import { Link } from "react-router-dom";

import WordCard from "./WordCard";

import FirebaseContext from "../../Firebase/context";

export default function CollectionView({ words }) {
  const firebase = useContext(FirebaseContext);

  const w = Object.values(words);

  return (
    <div className="row">
      <ul>
        {w.map((word) => (
          // <li key={word["id"]}>{word["id"]}</li>
          <Link to={`/collections/${word}`} key={word["id"]}>
            <WordCard analysis={word} key={word["id"]}></WordCard>
          </Link>
        ))}
      </ul>
    </div>
  );
}
