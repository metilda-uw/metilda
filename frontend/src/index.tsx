import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import configureStore from "./configureStore";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import HttpsRedirect from "react-https-redirect";
import Firebase, { FirebaseContext } from "./Firebase";
import { spinner } from "./Utils/LoadingSpinner";

const Root = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <div>{spinner()} </div>
    }

    return (
        <Provider store={configureStore()}>
            <BrowserRouter>
                <FirebaseContext.Provider value={new Firebase()}>
                    <HttpsRedirect>
                        <App />
                    </HttpsRedirect>
                </FirebaseContext.Provider>
            </BrowserRouter>
        </Provider>
    );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
