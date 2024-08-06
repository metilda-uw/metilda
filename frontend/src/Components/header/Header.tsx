import "./Header.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withAuthorization } from "../../Session";
import Submenu from "./DropdownComponent";
import SendMessagePopUp from "../../Notifications/SendMessagePopUp";
import ReactDOM from 'react-dom';
import {getUsers} from '../../Notifications/NotificationsUtils';
// import Badge from '@mui/material-next/Badge';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';
// import { AppState } from "../../store
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "../../store/appActions";
import { setCurrentUserRole } from "../../store/userDetails/actions";
import { connect } from "react-redux";
import { AppState } from "../../store";
import * as constants from "../../constants";
import Tooltip from '@material-ui/core/Tooltip';


interface State {
  anchorEl: any;
  isAdmin: boolean;
  numberOfNewMessages: number;
  isMessagesLoaded:boolean;
  dispalyCreatePitchArtTab:boolean;
}

interface HeaderProps {
  firebase: any;
  currentUserRole:string;
  setCurrentUserRole:(role:string) =>void;
}

class Header extends Component<HeaderProps, State> {
  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      anchorEl: null,
      isAdmin: false,
      numberOfNewMessages:0,
      isMessagesLoaded: false,
      dispalyCreatePitchArtTab:false,
    };
  }

  async componentDidMount() {
    if(this.props.currentUserRole == null){
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
          dispalyCreatePitchArtTab:true,
        });
        if(this.props.currentUserRole == null){
          this.props.setCurrentUserRole(constants.ADMIN_ROLE);
        }
      }else{
        await this.getCurrentUserRole();
      }
    }else{
      if(this.props.currentUserRole === constants.ADMIN_ROLE){
        this.setState({
          isAdmin: true,
          dispalyCreatePitchArtTab:true,
        });
      }else if(this.props.currentUserRole === constants.TEACHER_ROLE || this.props.currentUserRole === constants.RESEARCHER_ROLE){
        this.setState({
          dispalyCreatePitchArtTab:true,
        });
      }
    }
    
    let noOfUnReadMessages = 0;
    try {
        const currentUser = this.props.firebase.auth.currentUser && this.props.firebase.auth.currentUser.email;
        if(currentUser == null || currentUser == undefined) return;
      
        const receivedCollection =  await this.props.firebase.firestore.collection('Messages').doc(currentUser).collection('Received');
  
        // Get data from the "sent" subcollection of current user.
        const unsubscribe = receivedCollection.onSnapshot((snapshot) => {
            const receivedMessages = snapshot.docs.map((doc) => {
                const newObj = {...doc.data(), id: doc.id};
                return newObj
            });

            noOfUnReadMessages = receivedMessages.reduce((unreadMesages, msg) => { 
              if(!msg.isRead){
                return unreadMesages + 1;
              }else{
                return unreadMesages;
              }
            }, 0);

            this.setState({
              numberOfNewMessages : noOfUnReadMessages,
              isMessagesLoaded:true
            })
        });
        
        return unsubscribe;
    }catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }

  };

  getCurrentUserRole = async() =>{
    let userRole = null;
    if(this.props.currentUserRole == null){
      const response = await fetch(`/api/get-user-roles/${this.props.firebase.auth.currentUser.email}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
      );
      const body = await response.json();
      if(body && body.result && body.result.length > 0 && body.result[0][0]){
        userRole = body.result[0][0];
        this.props.setCurrentUserRole(userRole);
      }else{
        this.props.setCurrentUserRole(constants.STUDENT_ROLE);
      }
    }
    userRole = this.props.currentUserRole;
    if(userRole === constants.ADMIN_ROLE || userRole === constants.TEACHER_ROLE || userRole === constants.RESEARCHER_ROLE){
      this.setState({
        dispalyCreatePitchArtTab:true
      })
    }
    
  };

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

  renderSendMessageOverlay = async () =>{
   

    const users = await getUsers() as any;
    
    const usersData = users.map((user) =>{ return {value:user.id , label: user.name}});

    const appSelector = document.querySelector('.App');
    const sendMessagePopUp = <SendMessagePopUp usersData = {usersData} firebase={this.props.firebase}></SendMessagePopUp>;

    // Render the React component inside the modal
    const container = document.createElement('div');
    appSelector.appendChild(container);
    
    // Render the SendMessagePopUp component into the container element
    ReactDOM.render(sendMessagePopUp, container);
    
  }

  render() {
    return (
      <div>
        <nav className="nav">
          <ul className="nav-menu">
         
            <li className="nav-menu-item">
              <Link to="/home">Home</Link>
            </li>
            <li className="nav-menu-item">
              {/* {this.state.dispalyCreatePitchArtTab ? */}
                <Link to="/pitchartwizard" className={this.state.dispalyCreatePitchArtTab ? "" : "disabled-link"}>
                  Create Pitch Art
                </Link>
              {/* :
              <Tooltip className="Info-tooltip right" title={<p className="tooltip-content">{constants.CREATE_PITCH_ART_PAGE_TOOLTIP}</p>}
                    placement="bottom" arrow>
                    <span className="name">Create Pitch Art</span>
                  </Tooltip>
              } */}
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
            <li className="nav-menu-item right">
                {/* <Link to="/notifications">Notifications</Link> */}
                <a>Notifications {this.state.isMessagesLoaded && 
                <Badge badgeContent={this.state.numberOfNewMessages}
                  color="primary"
                  className="notification-badge">
                  <MailIcon color="action" />
                </Badge>

                }</a>
                <Submenu
                  navLinks={[
                    {
                      name: "Messages",
                      link: "/notifications",
                    },
                    {
                      name: "Send Message",
                      isALink:false,
                      isAButton:true,
                      method:this.renderSendMessageOverlay
                    }
                  ]}
                />
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

const mapStateToProps = (state: AppState) => ({
  currentUserRole: state.userDetails.currentUserRole
  
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AppActions>
) => ({
  setCurrentUserRole:(role:string) => dispatch(setCurrentUserRole(role)),
 
});
const condition = (authUser: any) => !!authUser;
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthorization(condition)(Header as any));
