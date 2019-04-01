import {applyMiddleware, createStore, Store} from "redux";
import thunk from "redux-thunk";
import {AppState, reducers} from "./store/index";

export default function configureStore(): Store<AppState> {
    return createStore(
        reducers,
        applyMiddleware(thunk),
    );
}
