import { mount } from "enzyme";
import * as React from "react";

import { expect } from "../../setupTests";

import Firebase from "../../Firebase/firebase";

import WordCard from "./WordCard";

const firebase = new Firebase();
import FirebaseContext from "../../Firebase/context";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("renders <WordCard />", () => {
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
  it("renders an WodCard", () => {
    const subject = mount(
      <FirebaseContext.Provider value={firebase}>
        <WordCard {...initialProps} />
      </FirebaseContext.Provider>
    );
    expect(subject.find(".card")).to.be.present();
  });
});
