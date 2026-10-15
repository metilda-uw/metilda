import { ensureRegistered, forgetRegistrationCheck } from "./ensureRegistered";

const firebaseFor = (token: string | null) => ({
  auth: { currentUser: token ? { getIdToken: () => Promise.resolve(token) } : null },
});
const user = { uid: "uid-1", email: "me@example.com" };

describe("ensureRegistered", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    window.sessionStorage.clear();
    fetchMock = jest.fn().mockResolvedValue(new Response(JSON.stringify({ result: "created" }), { status: 200 }));
    (window as any).fetch = fetchMock;
  });

  it("asks the server to register the signed-in user with the login token", async () => {
    await ensureRegistered(firebaseFor("token-1"), user);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/ensure-user");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-1");
  });

  it("checks each user only once per tab", async () => {
    await ensureRegistered(firebaseFor("token-1"), user);
    await ensureRegistered(firebaseFor("token-1"), user);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("checks again after signing out", async () => {
    await ensureRegistered(firebaseFor("token-1"), user);
    forgetRegistrationCheck();
    await ensureRegistered(firebaseFor("token-1"), user);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("tries again next time when the server could not do it", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }));

    await ensureRegistered(firebaseFor("token-1"), user);
    await ensureRegistered(firebaseFor("token-1"), user);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does nothing without a signed-in user or a token", async () => {
    await ensureRegistered(firebaseFor("token-1"), null);
    await ensureRegistered(firebaseFor(null), user);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws, even when the network fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    await expect(ensureRegistered(firebaseFor("token-1"), user)).resolves.toBeUndefined();
  });
});
