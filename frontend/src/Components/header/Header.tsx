import "./Header.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withAuthorization } from "../../Session";
import Submenu from "./DropdownComponent";

interface HeaderProps {
  firebase: any;
}
interface State {
  anchorEl: any;
  isAdmin: boolean;
}
class Header extends Component<HeaderProps, State> {
  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      anchorEl: null,
      isAdmin: false,
    };
  }

  async componentDidMount() {
    const response = await fetch(
      `/api/get-user-with-verified-role/${this.props.firebase.auth.currentUser.email}` +
        "?user-role=Admin",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body = await response.json();
    if (body.result != null && body.result.length > 0) {
      this.setState({
        isAdmin: true,
      });
    }
  }

  handleClick = (event: any) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  renderNavBarItem = (title: string, link: string, index: number) => {
    return (
      <li
        key={index}
        className={window.location.href.includes(link) ? "active" : ""}
      >
        <Link to={link}>{title}</Link>
      </li>
    );
  };

  onChange = (event: any) => {
    // location.href = event.value;
  };

  render() {
    return (
      <div>
        <nav className="nav">
          <ul className="nav-menu">
         
            <li className="nav-menu-item">
              <Link to="/home">Home</Link>
            </li>
            <li className="nav-menu-item">
              <Link to="/pitchartwizard">Create Pitch Art</Link>
            </li>
           
            <li className="nav-menu-item">
              <a>Explore</a>
              <Submenu
                navLinks={[
                  {
                    name: "Learn",
                    link: "/learn/words/syllables",
                  },
                  {
                    name: "Collections",
                    link: "/collections",
                  },
                  {
                    name: "PELDA",
                    link: "/peldaview",
                  },
                ]}
              />
            </li>
            <li className="nav-menu-item">
              <a>My Account</a>
              <Submenu
                navLinks={[
                  {
                    name: "History",
                    link: "/history",
                  },
                  {
                    name: "My Files",
                    link: "/my-files",
                  },
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
              {/* update this to documentation and change page link too  */}
           
            </li>
            <li className="nav-menu-item">
              <Link to="/converter">Converter</Link>
            </li>
            <li className="nav-menu-item">
              <Link to="/feedback">Feedback</Link>
            </li>
            {this.state.isAdmin && (
              <li className="nav-menu-item">
                <Link to="/manage-users">Manage Users</Link>
              </li>
            )}
             <li className="nav-menu-item">
              <Link to="/documentation">Documentation</Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
const condition = (authUser: any) => !!authUser;
export default withAuthorization(condition)(Header as any);
