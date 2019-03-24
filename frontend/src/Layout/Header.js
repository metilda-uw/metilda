import React, {Component} from 'react';
import '../App.css';
import './Header.css'
import {Link} from "react-router-dom";

class Header extends Component {
    state = {};

  componentDidMount() {}

  render() {
    return (
        <nav>
            <div id="metilda-navbar" className="row">
                <a href="/pitchartwizard" className="app-logo metilda-navbar-item">MeTILDA</a>
                <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><a href="/pitchartwizard">Create</a></li>
                    <li><a href="/learn/words/syllables">Learn</a></li>
                </ul>
            </div>
        </nav>
    );
  }
}

export default Header;
