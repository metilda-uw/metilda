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
                <a href="/" className="app-logo metilda-navbar-item">MeTILDA</a>
            </div>
        </nav>
    );
  }
}

export default Header;
