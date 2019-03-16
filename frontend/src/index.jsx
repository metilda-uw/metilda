"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
require("./index.css");
var App_1 = require("./App");
var serviceWorker = require("./serviceWorker");
var react_router_dom_1 = require("react-router-dom");
var store_1 = require("./store");
var react_redux_1 = require("react-redux");
ReactDOM.render(<react_redux_1.Provider store={store_1.default()}>
        <react_router_dom_1.BrowserRouter>
            <App_1.default />
        </react_router_dom_1.BrowserRouter>
    </react_redux_1.Provider>, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
