import "./Header.scss";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withAuthorization } from "../../Session";
import Submenu from "./DropdownComponent";
import { FaUserCircle } from "react-icons/fa";

interface HeaderProps {
  firebase: any;
}

interface State {
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  expandedMenu: string | null;
  courseName: string | null;
}

class Header extends Component<HeaderProps, State> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isAdmin: false,
      isModerator: false,
      isUser: false,
      expandedMenu: null,
      courseName: null,
    };
  }

  componentDidMount() {
    this.setState({
      isAdmin: localStorage.getItem("admin") === "true",
      isModerator: localStorage.getItem("moderator") === "true",
      isUser: localStorage.getItem("user") === "true",
      courseName: localStorage.getItem("course_name")
    });
  }

  handleSubmenuToggle = (menuName: string, isOpen: boolean) => {
    this.setState({ expandedMenu: isOpen ? menuName : null });
  };

  render() {
    return (
      <nav className="nav">
        <div className="nav-menu">
          <div className="nav-menu-item">
            <Link to="/home">Home</Link>
          </div>
          <div className="nav-menu-item">
            <Link to="/pitchartwizard">Create Pitch Art</Link>
          </div>
          <div className={`nav-menu-item ${this.state.expandedMenu === "explore" ? "expanded" : ""}`}>
            <a>Explore</a>
            <Submenu
              navLinks={[
                { name: "Learn", link: "/learn/words/syllables" },
                { name: "Collections", link: "/collections" },
                { name: "PELDA", link: "/peldaview" },
              ]}
              onToggle={(isOpen) => this.handleSubmenuToggle("explore", isOpen)}
            />
          </div>
          <div className="nav-menu-item">
            <Link to="/converter">Converter</Link>
          </div>
          <div className="nav-menu-item">
            <Link to="/feedback">Feedback</Link>
          </div>
          {this.state.isAdmin && (
            <div className="nav-menu-item">
              <Link to="/manage-users">Manage Users</Link>
            </div>
          )}
          <div className="nav-menu-item">
            <Link to={this.state.isUser ? "/student-view" : this.state.isModerator ? "/content-management" : ""}>
              Courses System
            </Link>
          </div>
          <div className="nav-menu-item">
            <Link to="/documentation">Documentation</Link>
          </div>
          <div className="nav-user-icon">
            <div className="nav-menu-item">
              <FaUserCircle size={24} className="cursor-pointer" />
              <Submenu style={{right: '0', left: 'unset'}}
                navLinks={[
                  { name: "History", link: "/history" },
                  { name: "My Files", link: "/my-files" },
                  { name: "Settings", link: "/manage-account" },
                  { name: "Signout", link: "/signout" },
                ]}
                onToggle={(isOpen) => this.handleSubmenuToggle("account", isOpen)}
              />
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

const condition = (authUser: any) => !!authUser;
export default withAuthorization(condition)(Header as any);