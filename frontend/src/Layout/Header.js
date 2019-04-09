import React, {Component} from 'react';
import '../App.css';
import './Header.css'
import {Link} from "react-router-dom";

class Header extends Component {
    state = {};

    componentDidMount() {
    }

    renderNavBarItem = (title, link, index) => {
        return (
            <li key={index} className={window.location.href.includes(link) ? 'active' : ''}>
                <a href={link}>
                    {title}
                </a>
            </li>
        );
    }

    render() {
        const navBarLinks = [
            {title: "Create", link: "/pitchartwizard"},
            {title: "Learn", link: "/learn/words/syllables"}
        ];

        return (
            <nav>
                <div id="metilda-navbar" className="row">
                    <a href="/pitchartwizard" className="app-logo metilda-navbar-item">MeTILDA</a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        {navBarLinks.map((item, index) =>
                            this.renderNavBarItem(item.title, item.link, index)
                        )}
                    </ul>
                </div>
            </nav>
        );
    }
}

export default Header;
