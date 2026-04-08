import { mount } from "enzyme";
import * as React from "react";
import { Provider } from "react-redux";

import { expect } from "../../setupTests";
import SaveAnalysisFirestore from "./SaveAnalysisFirestore";
import Firebase from "../../Firebase/firebase";
import FirebaseContext from "../../Firebase/context";
import configureStore from "../../configureStore";

const firebase = new Firebase();

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({}),
}));

describe("renders <SaveAnalysisFirestore />", () => {
  it("renders an SaveAnalysisFirestore", () => {
    const store = configureStore();
    const subject = mount(
      <Provider store={store}>
        <FirebaseContext.Provider value={firebase}>
          <SaveAnalysisFirestore
            callBacks={{}}
            data={{ speakerName: "", word: "", wordTranslate: "" }}
          />
        </FirebaseContext.Provider>
      </Provider>
    );
    expect(subject.find(".page-create-save-collections")).to.be.present();
    expect(subject.find(".page-create-save-collections-form")).to.be.present();
  });
});
