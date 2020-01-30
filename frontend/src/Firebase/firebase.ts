import app from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyBO-NeTgR5i13a4fawJylwyoOfTXigvYmU",
  authDomain: "metilda-c5ed6.firebaseapp.com",
  databaseURL: "https://metilda-c5ed6.firebaseio.com",
  projectId: "metilda-c5ed6",
  storageBucket: "gs://metilda-c5ed6.appspot.com/",
  messagingSenderId: "844859558075",
  appId: "1:844859558075:web:ef6fb0e686fb4d3b",
};

class Firebase {
  private auth: any;
  private db: any;
  private storage: any;
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    // this.db = app.database();
    this.storage = app.storage();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email: string, password: string) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  doSignInWithEmailAndPassword = (email: string, password: string) =>
    this.auth.signInWithEmailAndPassword(email, password)

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password: string) =>
    this.auth.currentUser.updatePassword(password)

  // *** User API ***

  // user = (uid: string) => this.db.ref(`users/${uid}`);

  // users = () => this.db.ref("users");

  // *** Cloud Storage API ***/
  uploadFile = () =>  this.storage.ref();
}

export default Firebase;
