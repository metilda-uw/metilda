import { shallow } from "enzyme";
import * as React from "react";
import sinon from "sinon";
import { NotificationManager } from "react-notifications";
import { expect } from "../setupTests";
import { History, HistoryProps } from "./History";

const mockedFetch = sinon.stub(window, "fetch");

const image = (id: number, name: string) => ({
  id,
  name,
  createdAt: "",
  imageUrl: `/images/${name}`,
  imagePath: `me@x.com/Images/${name}.png`,
  legendPath: `me@x.com/Images/${name}_legend.png`,
  checked: true,
});

// A Storage double: records every path that was deleted, and can fail chosen paths.
function fakeFirebase(failOn: { [path: string]: string } = {}) {
  const deleted: string[] = [];
  return {
    deleted,
    uploadFile: () => ({
      child: (path: string) => ({
        delete: () => {
          if (failOn[path]) {
            return Promise.reject({ code: failOn[path] });
          }
          deleted.push(path);
          return Promise.resolve();
        },
      }),
    }),
  };
}

// The server double: one answer per call, in order.
function serverAnswers(...answers: { status?: number; body: any }[]) {
  mockedFetch.reset();
  let call = 0;
  mockedFetch.callsFake(() => {
    const answer = answers[Math.min(call, answers.length - 1)];
    call += 1;
    return Promise.resolve(new Response(JSON.stringify(answer.body), { status: answer.status || 200 }));
  });
}

function render(firebase: any, images: any[]) {
  const subject = shallow(<History {...({ firebase } as HistoryProps)} />, {
    disableLifecycleMethods: true,
  });
  subject.setState({ allUploadedImages: images });
  return subject;
}

const deleteSelected = (subject: any) => (subject.instance() as History).deleteSelectedHistory();

describe("History delete selected", () => {
  let confirmStub: sinon.SinonStub;
  let success: sinon.SinonStub;
  let error: sinon.SinonStub;
  let info: sinon.SinonStub;

  beforeEach(() => {
    confirmStub = sinon.stub(window, "confirm").returns(true);
    success = sinon.stub(NotificationManager, "success");
    error = sinon.stub(NotificationManager, "error");
    info = sinon.stub(NotificationManager, "info");
  });

  afterEach(() => {
    confirmStub.restore();
    success.restore();
    error.restore();
    info.restore();
  });

  it("deletes the database rows first and then only the files the server reports", async () => {
    const firebase = fakeFirebase();
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: ["me@x.com/Analyses/a1.json"] } });
    const subject = render(firebase, [image(1, "A")]);

    await deleteSelected(subject);

    expect(mockedFetch.callCount).to.equal(1);
    expect(mockedFetch.firstCall.args[0]).to.equal("/api/delete-image-with-analyses");
    expect((mockedFetch.firstCall.args[1] as any).body.get("image_id")).to.equal("1");
    expect(firebase.deleted).to.deep.equal([
      "me@x.com/Analyses/a1.json",
      "me@x.com/Images/A_legend.png",
      "me@x.com/Images/A.png",
    ]);
    expect(subject.state("allUploadedImages")).to.deep.equal([]);
    expect(success.calledWith("Selected history item deleted.")).to.equal(true);
  });

  it("keeps the analysis file when another image still uses the analysis", async () => {
    const firebase = fakeFirebase();
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: [] } });
    const subject = render(firebase, [image(1, "A")]);

    await deleteSelected(subject);

    // Only the image and its legend are removed: no analysis file is touched.
    expect(firebase.deleted).to.deep.equal(["me@x.com/Images/A_legend.png", "me@x.com/Images/A.png"]);
    expect(subject.state("allUploadedImages")).to.deep.equal([]);
  });

  it("deletes a shared analysis file only with the last image that uses it", async () => {
    const firebase = fakeFirebase();
    serverAnswers(
      { body: { result: 1, deletedAnalysisPaths: [] } },
      { body: { result: 1, deletedAnalysisPaths: ["me@x.com/Analyses/shared.json"] } }
    );
    const subject = render(firebase, [image(1, "A"), image(2, "B")]);

    await deleteSelected(subject);

    expect(firebase.deleted.filter((p) => p.includes("/Analyses/"))).to.deep.equal([
      "me@x.com/Analyses/shared.json",
    ]);
    expect(subject.state("allUploadedImages")).to.deep.equal([]);
    expect(success.calledWith("2 history items deleted.")).to.equal(true);
  });

  it("deletes nothing from Storage when the server refuses", async () => {
    const firebase = fakeFirebase();
    serverAnswers({ status: 500, body: { result: "Error: could not delete the image" } });
    const subject = render(firebase, [image(1, "A")]);

    await deleteSelected(subject);

    expect(firebase.deleted).to.deep.equal([]);
    expect(subject.state("allUploadedImages")).to.have.length(1);
    expect(error.calledOnce).to.equal(true);
    expect(success.called).to.equal(false);
  });

  it("ignores files that are already missing from Storage", async () => {
    const firebase = fakeFirebase({ "me@x.com/Images/A.png": "storage/object-not-found" });
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: [] } });
    const subject = render(firebase, [image(1, "A")]);

    await deleteSelected(subject);

    expect(subject.state("allUploadedImages")).to.deep.equal([]);
    expect(error.called).to.equal(false);
    expect(success.calledWith("Selected history item deleted.")).to.equal(true);
  });

  it("removes the item and warns when unused files could not be deleted afterwards", async () => {
    const firebase = fakeFirebase({ "me@x.com/Images/A.png": "storage/unauthorized" });
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: [] } });
    const subject = render(firebase, [image(1, "A")]);

    await deleteSelected(subject);

    // The database no longer has the image, so it leaves the list; the leftover file is reported.
    expect(subject.state("allUploadedImages")).to.deep.equal([]);
    expect(error.calledOnce).to.equal(true);
    expect(String(error.firstCall.args[0])).to.contain("some of its files could not be removed");
    expect(info.calledOnce).to.equal(true);
  });

  it("does nothing when the confirmation is cancelled", async () => {
    confirmStub.returns(false);
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: [] } });
    const subject = render(fakeFirebase(), [image(1, "A")]);

    await deleteSelected(subject);

    expect(mockedFetch.called).to.equal(false);
    expect(subject.state("allUploadedImages")).to.have.length(1);
  });

  it("asks to select an image first", async () => {
    serverAnswers({ body: { result: 1, deletedAnalysisPaths: [] } });
    const unchecked = { ...image(1, "A"), checked: false };
    const subject = render(fakeFirebase(), [unchecked]);

    await deleteSelected(subject);

    expect(info.calledWith("Select at least one image to delete.")).to.equal(true);
    expect(mockedFetch.called).to.equal(false);
  });
});
