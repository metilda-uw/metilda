import app from "firebase/app";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBO-NeTgR5i13a4fawJylwyoOfTXigvYmU",
  authDomain: "metilda-c5ed6.firebaseapp.com",
  databaseURL: "https://metilda-c5ed6.firebaseio.com",
  projectId: "metilda-c5ed6",
  storageBucket: "gs://metilda-c5ed6.appspot.com/",
  messagingSenderId: "844859558075",
  appId: "1:844859558075:web:ef6fb0e686fb4d3b",
};

class Firebase {
  auth: any;
  firestore: any;
  timestamp: any;
  storage: any;
  realtimedb: any;

  constructor() {
    app.initializeApp(firebaseConfig);
    this.auth = app.auth();
    this.storage = app.storage();
    this.firestore = firebase.firestore();
    this.timestamp = firebase.firestore.Timestamp;
    this.realtimedb = firebase.database();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email: string, password: string) =>
      this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email: string, password: string) =>
      this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password: string) =>
      this.auth.currentUser.updatePassword(password);

  // *** Cloud Storage API ***/
  uploadFile = () => this.storage.ref();

  getCreatePageData = (path: string) => {
    return this.realtimedb.ref(path);
  }

  writeDataToPage = (name: string, value: any, path: string) => {
    firebase.database().ref(path).set({
      [name]: value
      });
  }
  createPage = () => {
    const newReference = firebase.database().ref().push().key;
    return newReference;
  }
  deletePage = (path: string) => {
    firebase.database().ref(path).remove();
  }
  updateValue = (name: string, value: any, reference: string) => {
    firebase.database().ref(reference).update({[name] : value});
  }
}
export default Firebase;
