import { mount } from "enzyme";
import * as React from "react";

import { expect } from "../../setupTests";

import Firebase from "../../Firebase/firebase";

import CollectionView from "./CollectionView";

import WordCard from "./WordCard";

import { arbitrarySpeaker } from "../../testSupport/arbitraryObjects";

import sinon from "sinon";

const firebase = new Firebase();
import FirebaseContext from "../../Firebase/context";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("renders <CollectionView />", () => {
  const initialProps = {
    words: [
      {
        id: "LDq1iCnsnERvuSmaumsK",
        data: {
          uploadId: "PHEOP164_nitomitaamONCE.wav",
          createdAt: "",
          letters: [],
          fileIndex: 1928,
          word: "nitomitaam",
          wordTranslation: '"my dog"',
          speakerName: "Earl Old Person",
        },
      },
    ],
    selectedCollection: "blackfoot",
    selectedCollectionUuid: "",
  };
  it("renders an CollectionView", () => {
    const subject = mount(
      <FirebaseContext.Provider value={firebase}>
        <CollectionView {...initialProps} />
      </FirebaseContext.Provider>
    );
    expect(subject.find(".page-collections-view")).to.be.present();
    expect(subject.find(WordCard)).to.be.present();
  });
});
