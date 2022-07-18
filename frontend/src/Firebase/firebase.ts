import app from "firebase/app";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApNGjZ64mit03pD_92T7EZZ15UjeSxy44",
  authDomain: "metilda-development.firebaseapp.com",
  databaseURL: "https://metilda-development-default-rtdb.firebaseio.com",
  projectId: "metilda-development",
  storageBucket: "metilda-development.appspot.com",
  messagingSenderId: "1093113246351",
  appId: "1:1093113246351:web:38d5913355eb8fe32eb6fa"
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
    const data = this.realtimedb.ref(path);
    data.on("value", (snapshot) => {
      console.log(snapshot.val());
    });
  }

  writeDataToPage = (name: string, value: any, path: string) => {
      firebase.database().ref(path).set({
        [name]: value
      });
    }
  createPage = () => {
    const newReference = firebase.database().ref().child("create").push().key;
    return `/create/${newReference}`;
  }
  updateValue = (name: string, value: any, reference: string) => {
    const update = {};
    update[reference] = {name: value};
    firebase.database().ref().update(update);
  }
}
export default Firebase;
