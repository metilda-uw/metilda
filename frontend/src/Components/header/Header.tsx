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
  isModerator: boolean;
  isUser: boolean;
}
class Header extends Component<HeaderProps, State> {
  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      anchorEl: null,
      isAdmin: false,
      isModerator: false,
      isUser: false
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

    
    const response_moderator = await fetch(
      `/api/get-user-with-verified-role/${this.props.firebase.auth.currentUser.email}` +
        "?user-role=Teacher",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body_moderator = await response_moderator.json();
    if (body_moderator.result != null && body_moderator.result.length > 0) {
      this.setState({
        isModerator: true,
      });
    }

    const response_user = await fetch(
      `/api/get-user-roles/${this.props.firebase.auth.currentUser.email}` +
        "?user-role=Student",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const body_user = await response_user.json();
    if (body_user.result != null && body_user.result[0][0]==='Student') {
      this.setState({
        isUser: true,
      });
    }

    let node = document.getElementById('course-system-link')
    if(node)
      node.style.setProperty('pointer-events', 'unset')
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
              <Link id={'course-system-link'} to={
                this.state.isUser ? "/student-view" :
                  this.state.isModerator ? "/content-management" :''
              } style={{ 'pointerEvents': 'none' }}>Courses System</Link>
            </li>
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
