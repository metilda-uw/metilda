import { mount } from "enzyme";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";

import { expect } from "../setupTests";
import { arbitrarySpeaker } from "../testSupport/arbitraryObjects";
import { Letter, Speaker } from "../types/types";

import Collections from "./Collections";

import Firebase from "../Firebase/firebase";
import FirebaseContext from "../Firebase/context";

import sinon from "sinon";
import CollectionView from "../Components/collections/CollectionView";

const firebase = new Firebase();

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("renders <SaveAnalysisFirestore />", () => {
  it("renders an SaveAnalysisFirestore", () => {
    const subject = mount(
      <BrowserRouter>
        <FirebaseContext.Provider value={firebase}>
          <Collections />
        </FirebaseContext.Provider>
      </BrowserRouter>
    );
    expect(subject.find(".page-collections")).to.be.present();
    expect(subject.find(CollectionView)).to.be.present();
  });
});
