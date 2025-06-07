import React, { Component } from "react";
import { withAuthorization } from "../../Session";
import { Link } from "react-router-dom";

interface Props {
  navLinks: any;
  onToggle?: (isOpen: boolean) => void;  // Allow onToggle as an optional prop
}

class Submenu extends Component<Props> {
  constructor(props: any) {
    super(props);
  }

  handleMouseEnter = () => {
    if (this.props.onToggle) {
      this.props.onToggle(true); // Notify parent (Header.tsx) that submenu opened
    }
  };

  handleMouseLeave = () => {
    if (this.props.onToggle) {
      this.props.onToggle(false); // Notify parent that submenu closed
    }
  };

  render() {
    return (
      <ul className="nav-submenu" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        {this.props.navLinks.map((navLink: any, index: any) => (
          <li className="nav-submenu-item" key={index}>
            <Link to={{ pathname: navLink.link, state: { from: "nav-link" } }}>
              {navLink.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}

const condition = (authUser: any) => !!authUser;
export default withAuthorization(condition)(Submenu as any) as any;