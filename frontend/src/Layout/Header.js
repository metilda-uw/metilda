import React, {Component} from 'react';
import '../App.css';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
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
                <ul className="metilda-navbar-item">
                    <li><Link to="/pitchartwizard/1">Pitch Art Wizard</Link></li>
                </ul>
            </div>
        </nav>
    );
  }
}

export default Header;
