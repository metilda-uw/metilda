import { getUsers } from "./NotificationsUtils";

// getUsers is the recipient list for Send message (Header and Sent messages). The server answers
// only signed-in callers, so the request must carry the signed-in user's login token.
describe("getUsers", () => {
  let fetchMock: jest.Mock;
  const originalFetch = window.fetch;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [
            ["a@example.com", null, null, null, "User A"],
            ["b@example.com", null, null, null, "User B"],
          ],
        }),
    });
    (window as any).fetch = fetchMock;
  });

  afterEach(() => {
    (window as any).fetch = originalFetch;
  });

  it("sends the signed-in user's login token", async () => {
    const firebase = {
      auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("abc123") } },
    };
    await getUsers(firebase);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("api/get-users");
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });

  it("reads the id from position 0 and the name from position 4", async () => {
    const firebase = {
      auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("abc123") } },
    };
    const users = await getUsers(firebase);
    expect(users.map((user: any) => [user.id, user.name])).toEqual([
      ["a@example.com", "User A"],
      ["b@example.com", "User B"],
    ]);
  });

  it("sends no token when nobody is signed in", async () => {
    await getUsers({ auth: { currentUser: null } });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });
});
