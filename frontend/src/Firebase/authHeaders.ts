// Headers that tell the server who is calling: the signed-in user's Firebase ID token.
// With nobody signed in this is empty, and the server then refuses the request with 401.
export async function authHeaders(firebase: any): Promise<{ [name: string]: string }> {
  const user = firebase && firebase.auth && firebase.auth.currentUser;
  if (!user) {
    return {};
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}
