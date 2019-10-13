import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../constants/routes'
import Select from 'react-select'

interface Props {
  firebase: any
  history: any
}
interface State {
  username: string
  email: string
  passwordOne: string
  passwordTwo: string
  error: any
  [key: string]: any
}
const SignUpPage = () => (
  <div>
    <h3>Create an Account</h3>
    <SignUpForm />
  </div>
)

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  institution: '',
  role: '',
  checked: false,
  error: null,
}

class SignUpFormBase extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = (event: any) => {
    event.preventDefault()
    const { username, email, passwordOne } = this.state
    console.log(this.props)
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((authUser: any) => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
        })
      })
      .then((authUser: any) => {
        this.setState({ ...INITIAL_STATE })
        this.props.history.push(ROUTES.HOME)
      })
      .catch((error: any) => {
        this.setState({ error })
      })
  }

  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleCheckboxChange = (event: any) =>
    this.setState({ checked: event.target.checked })

  handleDropDownChange = (event: any) => this.setState({ role: event.value })

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      institution,
      role,
      checked,
      languageOfResearch,
      error,
    } = this.state

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      role === '' ||
      email === '' ||
      username === '' ||
      checked === false

    const options = [
      { value: 'linguistic_researcher', label: 'Linguistic Researcher' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'student', label: 'Student' },
      { value: 'other', label: 'Other' },
    ]

    const colourStyles = {
      control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
      option: (styles: any) => ({
        ...styles,
        ':hover': {
          ...styles[':hover'],
          backgroundColor: 'red',
        },
      }),
      input: (styles: any) => ({ ...styles, padding: '0px', margin: '0px' }),
    }
    const customStyles = {
      option: (provided: any, state: any) => ({
        ...provided,
        borderBottom: '1px dotted pink',
        color: state.isSelected ? 'red' : 'blue',
        padding: 20,
      }),
      control: () => ({
        // none of react-select's styles are passed to <Control />
        width: 200,
        height: '1em',
      }),
      singleValue: (provided: any, state: any) => {
        const opacity = state.isDisabled ? 0.5 : 1
        const transition = 'opacity 300ms'

        return { ...provided, opacity, transition }
      },
    }
    const Checkbox = (props: any) => <input type="checkbox" {...props} />
    const TermsOfUseLink = () => (
      <Link to={ROUTES.TERMS_OF_USE} className="terms_of_use_Link">
        terms of use
      </Link>
    )

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <input
          name="institution"
          value={institution}
          onChange={this.onChange}
          type="text"
          placeholder="University/Institution"
        />
        <input
          name="languageOfResearch"
          value={languageOfResearch}
          onChange={this.onChange}
          type="text"
          placeholder="Research Language"
        />

        <Select
          className="roles_Options"
          placeholder="Role"
          options={options}
          styles={colourStyles}
          onChange={this.handleDropDownChange}
        />
        <label className="terms_of_use">
          <Checkbox
            checked={this.state.checked}
            onChange={this.handleCheckboxChange}
          />
          <span>
            By clicking the checkbox, you agree to the {<TermsOfUseLink />}
          </span>
        </label>
        <button disabled={isInvalid} type="submit" className="signup_Submit">
          Sign Up
        </button>

        {error && <p>{error.message}</p>}
      </form>
    )
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
)
// const SignUpForm = withRouter(withFirebase(SignUpFormBase as any));
const SignUpForm = compose(
  withRouter,
  withFirebase
)(SignUpFormBase)
export default SignUpPage
export { SignUpForm, SignUpLink, SignUpPage }
