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
                <div className="col s2">
                    <a href="/" className="app-logo">MeTILDA</a>
                </div>
                <div className="col s2">
                    <ul>
                        <li><Link to="/pitchartwizard/1">Pitch Art Wizard</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
  }
}

export default Header;
