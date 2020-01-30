import React from "react";
import { withAuthorization } from "../Session";

interface Props {
  firebase: any;
}

interface State {
  loading: boolean;
  users: any[];
}

class AdminPage extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    // this.props.firebase.users().on("value", (snapshot: any) => {
    //   const usersObject = snapshot.val();

    //   const usersList = Object.keys(usersObject).map((key) => ({
    //     ...usersObject[key],
    //     uid: key,
    //   }));

    //   this.setState({
    //     users: usersList,
    //     loading: false,
    //   });
    // });
  }

  componentWillUnmount() {
    // this.props.firebase.users().off();
  }

  render() {
    const { users, loading } = this.state;

    return (
      <div>
        <h1>Admin</h1>
        {loading && <div>Loading ...</div>}
        <UserList users={users} />
      </div>
    );
  }
}

const UserList = (props: any) => {
  const users = props.user;
  return (
    <ul>
      {users.map((user: any) => (
        <li key={user.uid}>
          <span>
            <strong>ID:</strong> {user.uid}
          </span>
          <span>
            <strong>E-Mail:</strong> {user.email}
          </span>
          <span>
            <strong>Username:</strong> {user.username}
          </span>
        </li>
      ))}
    </ul>
  );
};
const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(AdminPage as any);
