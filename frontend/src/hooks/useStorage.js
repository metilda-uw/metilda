import { useReducer, useEffect, useState, useContext } from "react";
import Firebase from "../Firebase";
import FirebaseContext from "../Firebase/context";

export const useStorage = () => {
  const firebase = useContext(FirebaseContext);

  const storageRef = firebase.uploadFile();

  // add a file
  const addFile = async (file) => {
    try {
      const uploadRef = storageRef.child("thumbnails/" + file);
      var bytes = new Uint8Array([
        0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64,
        0x21,
      ]);
      uploadRef.put(bytes).then((snapshot) => {
        console.log("Uploaded an array!");
      });
    } catch (err) {
      console.log(err);
    }
  };

  //delete a file

  // update a file

  // deleteDocument, updateDocument, response
  return { addFile };
};
