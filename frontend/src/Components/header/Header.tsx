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
import { Box, Button, Collapse, Drawer, IconButton, Toolbar } from "@material-ui/core";
import  MenuIcon from "@material-ui/icons/Menu"


interface State {
  anchorEl: any;
  exploreAnchor: any;
  accountAnchor: any;
  notificationAnchor: any;
  openDrawer: boolean;
  isAdmin: boolean;
  numberOfNewMessages: number;
  isMessagesLoaded:boolean;
  dispalyCreatePitchArtTab:boolean;
  windowWidth: number;
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
      exploreAnchor: null,
      accountAnchor: null,
      notificationAnchor: null,
      openDrawer: false,
      isAdmin: false,
      numberOfNewMessages:0,
      isMessagesLoaded: false,
      dispalyCreatePitchArtTab:false,
      windowWidth: window.innerWidth
    };
  }

  async componentDidMount() {
    window.addEventListener("resize", this.setWindowWidth)
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
      }else if(this.props.currentUserRole === constants.TEACHER_ROLE || this.props.currentUserRole === constants.RESEARCHER_ROLE 
                  || this.props.currentUserRole === constants.STUDENT_ROLE || this.props.currentUserRole === constants.OTHER_ROLE){ // All roles can access Create Pitch Art
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

  setWindowWidth = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

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
    if(userRole === constants.ADMIN_ROLE || userRole === constants.TEACHER_ROLE || userRole === constants.RESEARCHER_ROLE || 
          userRole === constants.STUDENT_ROLE || userRole === constants.OTHER_ROLE){ // All roles can access Create Pitch Art
      this.setState({
        dispalyCreatePitchArtTab:true
      })
    }
    
  };

  handleClick = (anchor: string) => (event : any) => {
    this.setState({...this.state,  [anchor] : !this.state[anchor] });
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

  toggleDrawer = (open : boolean) => (event) => {
    this.setState({openDrawer : open})
  }

  // For drawer popout, submenus are replaced entirely, but they works well for 
  // large screen widths, so currently keeping them for that.
  renderNavButtons = () => {
    const {anchorEl} = this.state
    return (
      <>
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
          <a role="button" tabIndex={0}>Explore</a>
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
          <a role="button" tabIndex={0}>My Account</a>
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
          </li>
          {/* update this to documentation and change page link too  */}

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
            <li className="nav-menu-item right">
                {/* <Link to="/notifications">Notifications</Link> */}
                <a role="button" tabIndex={0}>Notifications {this.state.isMessagesLoaded && 
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
      </>
    )
  }

  // Render function for buttons that are contained within the drawer
  renderSidebarNavButtons = () => {
    const {exploreAnchor, accountAnchor, notificationAnchor} = this.state
    return (
      <Box 
        display='flex' 
        mt={2} mb={2} 
        flexDirection='column' 
        width='90%' 
        justifyContent='center' 
        margin='0 auto'
        style={{ gap: '8px' }}
      >
        <Button variant='contained' component={Link} to="/home">Home</Button>
        <Button variant='contained' component={Link} to="/pitchartwizard" className={this.state.dispalyCreatePitchArtTab ? "" : "disabled-link"}>
          Create Pitch Art
        </Button>
        <Button variant='contained' onClick={this.handleClick('exploreAnchor')}>Explore</Button>
          <Collapse className="Collapse" in={Boolean(exploreAnchor)} timeout='auto' unmountOnExit>
            <Button component={Link} to='/learn/words/syllables'>Learn</Button>
            <Button component={Link} to='/collections'>Collections</Button>
            <Button component={Link} to='/peldaview'>PELDA</Button>
          </Collapse>
        <Button variant='contained' onClick={this.handleClick('accountAnchor')}>My Account</Button>
          <Collapse className="Collapse" in={Boolean(accountAnchor)} unmountOnExit>
            <Button component={Link} to='/history'>History</Button>
            <Button component={Link} to='/my-files'>My Files</Button>
            <Button component={Link} to='/manage-account'>Manage Account</Button>
            <Button component={Link} to='/signout'>Sign Out</Button>
          </Collapse>
        <Button variant='contained' component={Link} to="/converter">Converter</Button>
        <Button variant='contained' component={Link} to="/feedback">Feedback</Button>
        {this.state.isAdmin && (
            <Button variant='contained' component={Link} to="/manage-users">Manage Users</Button>
        )}
        <Button variant='contained' component={Link} to="/documentation">Documentation</Button>
        <Button variant='contained' onClick={this.handleClick('notificationAnchor')}>Notifications {this.state.isMessagesLoaded &&
          <Badge badgeContent={this.state.numberOfNewMessages}
            color="primary"
            className="notification-badge">
            <MailIcon color="action" />
          </Badge>
        }</Button>
        <Collapse className="Collapse" in={Boolean(notificationAnchor)} unmountOnExit>
          <Button component={Link} to='/notifications'>Messages</Button>
          <Button onClick={this.renderSendMessageOverlay}>Send Message</Button>
        </Collapse>
      </Box>
    )
  }

  render() {
    const {windowWidth, openDrawer} = this.state
    const drawerWidth : string = (windowWidth > 600) ? '250px' : '100%'
    return (
      <div>
        <nav className="nav" aria-label="Main navigation">
          <ul className="nav-menu">
            {(windowWidth >= 1060) ? this.renderNavButtons() : <></>}
            {(windowWidth < 1060) ? (
              <li className="nav-menu-mobile-item">
                <Toolbar>
                  <IconButton aria-label='Open navigation menu' onClick={this.toggleDrawer(true)}><MenuIcon /></IconButton>
                  <div className="metilda-logo-text">MeTILDA</div>
                  <Drawer 
                    anchor={(windowWidth < 600) ? 'top' : 'left'} 
                    open={openDrawer} 
                    onClose={this.toggleDrawer(false)}
                    PaperProps={{ style: { width: drawerWidth} }}
                  >
                    {this.renderSidebarNavButtons()}
                  </Drawer>
                </Toolbar>
              </li>
            ) : (<></>)}
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
