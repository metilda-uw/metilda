import "../../../Pages/Collections.css";

import React, { useContext, useEffect, useState } from "react";

import FirebaseContext from "../../../Firebase/context";

import SingleBlockCollectionView from "./SingleBlockCollectionView";

export default function PitchArtblock({ collectionUUID, wordId }) {
  const firebase = useContext(FirebaseContext);

  const [availableCollections, setAvailableCollections] = useState([
    [
      33,
      "1880f9eb-e274-4093-ac6b-8e7fa9a05a84",
      "default",
      " ",
      " ",
      "",
    ],
  ]);

  const [words, setWords] = useState([]);
  const [update, setUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // call the collections api to get a list of collections
  // occurs on first render & when collectionsUpdated is changed
  useEffect(() => {
    fetch(`/api/collections`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log(res);
          return res.json();
        }

        throw new Error("Error: Unable to get the list of collections.");
      })
      .then((data) => setAvailableCollections(data.result))
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // query firestore for documents when the activeCollection is changed
  useEffect(() => {
    // check whether the list has changed with update === true
    if (Object.keys(words).length && !update) {
      return;
    }

    firebase.firestore
      .collection(collectionUUID)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          setWords([]);
        } else {
          querySnapshot.forEach((doc) => {
            //  creates an array of words in the collection
            const wordsInCollection = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }));
            setWords(wordsInCollection);
          });
        }
        setUpdate(false);
      })
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }, [update]);

  return (
    <div className="page-collections">
      {/* View of Collection w/ filtering capability */}
      <div className="page-collections-view">
        {words && (
          <SingleBlockCollectionView
            words={words}
            wordId={wordId}
            selectedCollectionUuid={collectionUUID}
          />
        )}

        {isLoading && <p>Loading collection...</p>}
      </div>
    </div>
  );
}
