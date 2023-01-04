import { shallow, mount } from "enzyme";
import * as React from "react";

import { expect } from "../../setupTests";
import SaveAnalysisFirestore from "./SaveAnalysisFirestore";
import Firebase from "../../Firebase/firebase";
import FirebaseContext from "../../Firebase/context";

const firebase = new Firebase();

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("renders <SaveAnalysisFirestore />", () => {
  it("renders an SaveAnalysisFirestore", () => {
    const subject = mount(
      <FirebaseContext.Provider value={firebase}>
        <SaveAnalysisFirestore />
      </FirebaseContext.Provider>
    );
    expect(subject.find(".page-create-save-collections")).to.be.present();
    expect(subject.find(".page-create-save-collections-form")).to.be.present();
  });
});
