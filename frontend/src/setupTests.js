import "fake-indexeddb/auto";
import { configure } from "enzyme";
import Adapter from "@cfaester/enzyme-adapter-react-18";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";

jest.mock("firebase/compat/auth", () => ({}));
jest.mock("firebase/compat/database", () => ({}));
jest.mock("firebase/compat/firestore", () => ({}));
jest.mock("firebase/compat/storage", () => ({}));

jest.mock("firebase/compat/app", () => {
  const chain = () => {
    const c = {
      collection: jest.fn(() => c),
      doc: jest.fn(() => c),
      update: jest.fn(() => Promise.resolve()),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      push: jest.fn(() => c),
      key: "mock-key",
    };
    return c;
  };
  const firestoreFn = jest.fn(() => {
    const fs = chain();
    fs.Timestamp = { now: jest.fn() };
    return fs;
  });
  firestoreFn.Timestamp = { now: jest.fn() };
  const firebase = {
    initializeApp: jest.fn(),
    auth: jest.fn(() => ({
      onAuthStateChanged: jest.fn((cb) => {
        if (cb) {
          cb(null);
        }
        return jest.fn();
      }),
      createUserWithEmailAndPassword: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      currentUser: null,
    })),
    database: jest.fn(() => ({
      ref: jest.fn(() => ({
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        remove: jest.fn(() => Promise.resolve()),
        push: jest.fn(() => ({ key: "mock-key" })),
      })),
    })),
    firestore: firestoreFn,
    storage: jest.fn(() => ({
      ref: jest.fn(() => ({})),
    })),
  };
  return { __esModule: true, default: firebase };
});

configure({ adapter: new Adapter() });
chai.use(chaiEnzyme());
export const expect = chai.expect;
