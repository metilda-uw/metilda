import React, { Component } from "react";
import "../App.scss";
import "./Header.scss";
import { withAuthorization } from "../Session";
import Submenu from "./DropdownComponent";
import { Link } from "react-router-dom";

class Header extends Component {
  state = {
    anchorEl: null,
  };
  handleClick = (event: any) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  }

  renderNavBarItem = (title: string, link: string, index: number) => {
    return (
      <li
        key={index}
        className={window.location.href.includes(link) ? "active" : ""}
      >
        <Link to={link}>{title}</Link>
      </li>
    );
  }

  onChange = (event: any) => {
    // location.href = event.value;
  }

  render() {
    return (
      <div>
        <nav className="nav">
          <ul className="nav__menu">
            <li className="nav__menu-item">
              <Link to="/home">Home</Link>
            </li>
            <li className="nav__menu-item">
              <a>Explore</a>
              <Submenu
                navLinks={[
                  {
                    name: "Create",
                    link: "/pitchartwizard",
                  },
                  {
                    name: "Learn",
                    link: "/learn/words/syllables",
                  },
                ]}
              />
            </li>
            <li className="nav__menu-item">
              <a>My Account</a>
              <Submenu
                navLinks={[
                  {
                    name: "Settings",
                    link: "/manage-account",
                  },
                  {
                    name: "Signout",
                    link: "/signout",
                  },
                ]}
              />
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
const condition = (authUser: any) => !!authUser;
export default withAuthorization(condition)(Header as any);
