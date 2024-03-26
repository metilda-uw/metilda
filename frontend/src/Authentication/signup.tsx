import React from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../constants/routes";
import Select from "react-select";
import ReactGA from "react-ga";
import TermsOfUseContent  from "./terms_of_use_content";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { NotificationManager } from "react-notifications";

const styles = (theme: Theme) =>
        createStyles({
            root: {
            margin: 0,
            padding: theme.spacing(2),
            },
            closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
            },
});

interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
        <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
        >
            <CloseIcon />
        </IconButton>
        ) : null}
    </MuiDialogTitle>
    );
});

export interface Props {
  firebase: any;
  history: any;
}
interface State {
  username: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
  role: any[];
  uid: string;
  languageOfResearch: any[];
  [key: string]: any;
}
const SignUpPage = () => (
  <div>
    <h3>Create an Account</h3>
    <SignUpForm />
  </div>
);

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  institution: "",
  role: [],
  uid: "",
  languageOfResearch: [],
  checked: false,
  isEmailConfirmationModalOpen:false,
  verificationCode:""
};

class SignUpFormBase extends React.Component<Props, State> {
  code;
  constructor(props: any) {
    super(props);
    this.code = -1;
    this.state = { ...INITIAL_STATE };
  }

  

  emailConfirmationModal = () => {
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={this.state.isEmailConfirmationModalOpen}
        onClose={this.closeEmailConfirmationModal}
        aria-labelledby="form-dialog-title"
        className="send-msg-modal"
      >
        <DialogTitle
          id="alert-dialog-title"
          onClose={this.closeEmailConfirmationModal}
        >
          <p className="dialog-title">Send Message</p>
        </DialogTitle>
        <DialogContent>
            <h3>Enter code here</h3>
            <input 
              type="text" 
              pattern="[0-9]" 
              title="Please enter digits only"
              maxLength={6} 
              value={this.state.verificationCode}  // Bind the value of the input field to the state variable
              onChange={this.handleInputChange}  // Handle input changes
            />
        </DialogContent>
        <DialogActions>
          <button
            className="sendMsg waves-effect waves-light btn globalbtn"
            onClick={this.compareVerficationCode}
          >
            Send
          </button>
        </DialogActions>
      </Dialog>
    );
 };

  closeEmailConfirmationModal = () =>{

    this.setState({isEmailConfirmationModalOpen: false});

  }

  handleInputChange = (e) =>{
    this.setState({verificationCode: e.target.value});

  }

  compareVerficationCode = (e) =>{
    if(this.code == -1){
      // handle case of invalid email address
      this.setState({isEmailConfirmationModalOpen: false, verificationCode: ""});
      NotificationManager.error('Your Email address is not valid');
      return;
    }

    // account verified
    if(this.code == this.state.verificationCode){
      this.setState({isEmailConfirmationModalOpen: false, verificationCode: ""});
      NotificationManager.success('Email verification is successful');
      this.onSubmit(e);
    }else{
      this.setState({isEmailConfirmationModalOpen: false,verificationCode: ""});
      NotificationManager.error('Email verification failed');
    }
    this.code = -1;

  }

  onSubmit = async (event: any) => {
    event.preventDefault();

    console.log("in on submit , account verified");
    const { username, email, passwordOne, institution } = this.state;
    try {
        const authUser = await this.props.firebase.doCreateUserWithEmailAndPassword(email, passwordOne);
        this.setState({
          uid: authUser.user.uid
        });
        ReactGA.set({
          userId: this.state.uid
        });
        ReactGA.event({
          category: "Sign Up",
          action: "User pressed sign up button",
          transport: "beacon"
        });
        const formData = new FormData();
        formData.append("user_id", email);
        formData.append("user_name", username);
        formData.append("university", institution);

        const response = await fetch(`/api/create-user`, {
          method: "POST",
          headers: {
              Accept: "application/json"
          },
          body: formData
        });
        const body = await response.json();
        for (const researchLanguage of this.state.languageOfResearch) {
          const recordingData = new FormData();
          const userId = body.result;
          recordingData.append("user_id", userId);
          recordingData.append("language", researchLanguage.value);
          const result =  await fetch(`/api/create-user-research-language`, {
            method: "POST",
            headers: {
            Accept: "application/json"
            },
            body: recordingData
            });
        }
        for (const userRole of this.state.role) {
          const roleData = new FormData();
          const userId = body.result;
          roleData.append("user_id", userId);
          roleData.append("user_role", userRole.value);
          const result =  await fetch(`/api/create-user-role`, {
            method: "POST",
            headers: {
            Accept: "application/json"
            },
            body: roleData
            });
        }
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      } catch (ex) {
        console.log(ex);
      }
  }


  verifyEmail = async (event) =>{

    event.preventDefault();
    const { username, email} = this.state;
    console.log("user name ", username);
    console.log("email ", email);

    const userEmail = email;
   
    const receiver= userEmail;
    const formData = new FormData();
    formData.append("receiver", receiver);
    formData.append("message", "Please verify your Email:");
    formData.append("subject", "Email verification");

    const response = await fetch(`/api/verify-email`, {
      method: "POST",
      headers: {
          Accept: "application/json"
      },
      body: formData
    });
    const body = await response.json();
    console.log("response from email", body);

    if(body)
      this.code = body.verificationCode;

    this.setState({ isEmailConfirmationModalOpen: true })

  }

  onChange = (event: any) => {
    if (event.target.name === "passwordTwo") {
      if (event.target.value !== this.state.passwordOne) {
        event.target.setCustomValidity("Passwords must match");
      } else {
        event.target.setCustomValidity("");
      }
    }

    this.setState({ [event.target.name]: event.target.value });
  }

  handleCheckboxChange = (event: any) =>
    this.setState({ checked: event.target.checked })

  handleRoleChange = (option: any) => {
      this.setState({
        role: option
      });
    }
  handleLanguageChange = (option: any) => {
      this.setState({
        languageOfResearch: option
      });
    }

  render() {
    const passwordLength = 10;
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      institution,
      role,
      languageOfResearch,
    } = this.state;
    const roleOptions = [
      { value: "Linguistic Researcher", label: "Linguistic Researcher" },
      { value: "Teacher", label: "Teacher" },
      { value: "Student", label: "Student" },
      { value: "Other", label: "Other" },
    ];
    const languageOptions = [
      { value: "Blackfoot", label: "Blackfoot" },
      { value: "English", label: "English" },
      { value: "French", label: "French" },
      { value: "Other", label: "Other" },
    ];

    const colourStyles = {
      control: (styles: any) => ({ ...styles, backgroundColor: "white" }),
      option: (styles: any) => ({
        ...styles,
        ":hover": {
          ...styles[":hover"],
          backgroundColor: "red",
        },
      }),
      input: (styles: any) => ({ ...styles, padding: "0px", margin: "0px" }),
    };
    const Checkbox = (props: any) => <input type="checkbox" {...props} />;
    const TermsOfUseLink = () => (
      
      <Link to={ROUTES.TERMS_OF_USE} target="_blank" className="terms_of_use_Link">
            terms of use
      </Link>
    );

    return (
      <>
        {this.emailConfirmationModal()}
        <form onSubmit={this.verifyEmail} className="SignUpForm">
        <input
          className="username"
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name *"
          required
        />
        <input
          className="email"
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address *"
          required
        />
        <input
          className="passwordOne"
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password *"
          required
          minLength={passwordLength}
        />
        <input
          className="passwordTwo"
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password *"
          required
        />
        <input
          className="institution"
          name="institution"
          value={institution}
          onChange={this.onChange}
          type="text"
          placeholder="University/Institution"
        />
        <Select isMulti
          className="language_Options"
          placeholder="Research Language"
          value={languageOfResearch}
          options={languageOptions}
          styles={colourStyles}
          onChange={this.handleLanguageChange}
        />

        <Select isMulti
          className="roles_Options"
          placeholder="Role"
          options={roleOptions}
          value={role}
          styles={colourStyles}
          onChange={this.handleRoleChange}
        />
        <label className="terms_of_use">
          <Checkbox
            className="TermsOfUseCheckBox"
            checked={this.state.checked}
            onChange={this.handleCheckboxChange}
            required
          />
          <span  >
            By clicking the checkbox, you agree to the {<TermsOfUseLink/>} *
          </span>
        </label>
        <button type="submit" className="signup_Submit globalbtn">
          Sign Up
        </button>
        <span className="mandatory_message">
           Fields marked with * are mandatory
        </span>
      </form>
      </>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase
)(SignUpFormBase);
export default SignUpPage;
export { SignUpForm, SignUpLink, SignUpPage, SignUpFormBase };
