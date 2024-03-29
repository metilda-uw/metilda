import React, { Component } from "react";
import { withAuthorization } from "../../Session";
import { Link } from "react-router-dom";

interface Props {
  navLinks: any;
}
class Submenu extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <ul className="nav-submenu">
        {this.props.navLinks.map((navLink: any, index: any) => (
          
          !navLink.isALink && navLink.isAButton ? 
          <button  className="nav-submenu-button" onClick={navLink.method} key={index}>{navLink.name}</button>:
          
          <li className="nav-submenu-item " key={index}>
            <Link to={{pathname: navLink.link, state: { from: 'nav-link' }}}>{navLink.name}</Link>
          </li>
          
        ))}
      </ul>
    );
  }
}

const condition = (authUser: any) => !!authUser;
export default withAuthorization(condition)(Submenu as any) as any;
