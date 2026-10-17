import { authHeaders } from "../Firebase/authHeaders";

// Remembers, for this browser tab, which signed-in user has already been checked.
const CHECKED_KEY = "metilda.registrationChecked";

// Makes sure the signed-in user has a MeTILDA account row. The server creates it when it is
// missing, for example for an account that signed up on the other site (staging and production
// share the logins but not the database). Runs at most once per tab per user and never blocks or
// breaks the page: a failure is ignored and tried again on the next page load.
export async function ensureRegistered(firebase: any, authUser: any): Promise<void> {
  if (!authUser || !authUser.uid) {
    return;
  }
  try {
    if (readChecked() === authUser.uid) {
      return;
    }
    const headers = await authHeaders(firebase);
    if (!headers.Authorization) {
      return;
    }
    const response = await fetch("/api/ensure-user", {
      method: "POST",
      headers: { Accept: "application/json", ...headers },
    });
    if (response.ok) {
      writeChecked(authUser.uid);
    }
  } catch (error) {
    // Never get in the way of the page; the next page load tries again.
  }
}

// After signing out, the next sign-in in this tab is checked again.
export function forgetRegistrationCheck(): void {
  try {
    window.sessionStorage.removeItem(CHECKED_KEY);
  } catch (error) {
    // Storage can be unavailable (private windows); nothing to forget then.
  }
}

function readChecked(): string | null {
  try {
    return window.sessionStorage.getItem(CHECKED_KEY);
  } catch (error) {
    return null;
  }
}

function writeChecked(uid: string): void {
  try {
    window.sessionStorage.setItem(CHECKED_KEY, uid);
  } catch (error) {
    // Storage can be unavailable; the check then simply runs again next time.
  }
}
