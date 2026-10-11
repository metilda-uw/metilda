import { authHeaders } from "./authHeaders";

describe("authHeaders", () => {
  it("sends the signed-in user's ID token as a Bearer token", async () => {
    const firebase = {
      auth: { currentUser: { getIdToken: jest.fn().mockResolvedValue("abc123") } },
    };
    expect(await authHeaders(firebase)).toEqual({ Authorization: "Bearer abc123" });
  });

  it("sends nothing when nobody is signed in", async () => {
    expect(await authHeaders({ auth: { currentUser: null } })).toEqual({});
  });

  it("sends nothing when there is no firebase object", async () => {
    expect(await authHeaders(undefined)).toEqual({});
  });
});
