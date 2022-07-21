import "./Collections.css";

import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { NotificationManager } from "react-notifications";

import Header from "../components/header/Header";
import CollectionsView from "../components/collections/CollectionsView";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createCollectionName, setCreateCollectionName] = useState("");
  const [collectionsUpdated, setCollectionsUpdated] = useState(0);

  useEffect(() => {
    fetch(`api/collections`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setCollections(data.result))
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.log(error);
      });
  }, [collectionsUpdated]);

  const getCollectionOptions = () => {
    let result = [];
    collections.map((col) => {
      result = [
        ...result,
        {
          value: col[1],
          label: col[1],
        },
      ];
    });
    return result;
  };

  const handleCollectionChange = () => {
    console.log("Changed collection");
    //this.setSelectedCollection(value);
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Create New Collection");
    const formData = new FormData();
    formData.append("collection_name", createCollectionName);
    const response = await fetch(`/api/collections`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const body = await response.json();
    console.log(body.result);
    setCreateCollectionName("");
    setCollectionsUpdated(collectionsUpdated + 1);
    //Notificaiton that Collection was created.
    //TODO: ADD error handling
    NotificationManager.success("Added collection successfully!");
  };

  const onChange = (event) => {
    console.log("Update Collection Name");
    setCreateCollectionName(event.target.value);
  };

  return (
    <>
      <Header />
      <div className="page-collections">
        {/* Select the Collection to View */}
        <div className="collections-select-create">
          <Select
            className="collections-dropdown"
            placeholder="Collection"
            value="Select a collection"
            options={getCollectionOptions()}
            //styles={colourStyles}
            onChange={handleCollectionChange}
          />
          <form onSubmit={onSubmit} className="collections-create">
            <input
              className="collections-create-name"
              name="Collection Name"
              value={createCollectionName}
              onChange={onChange}
              type="text"
              placeholder="Collection Name"
              required
            />
            <button type="submit" className="collections-submit globalbtn">
              Create
            </button>
          </form>
        </div>

        {/* View of Collection w/ filtering capability */}
        {/* TODO: Add collection props.  Add to the CollectionsView component as well */}
        <CollectionsView collection={selectedCollection} />
      </div>
    </>
  );
}
