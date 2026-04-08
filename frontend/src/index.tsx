import * as React from "react";
import { createRoot } from "react-dom/client";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import App from "./App";
import configureStore from "./configureStore";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import HttpsRedirect from "react-https-redirect";
import Firebase, { FirebaseContext } from "./Firebase";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <Provider store={configureStore()}>
        <BrowserRouter>
        <FirebaseContext.Provider value = {new Firebase()}>
        <HttpsRedirect>
            <App/>
        </HttpsRedirect>
        </FirebaseContext.Provider>
        </BrowserRouter>
    </Provider>
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
