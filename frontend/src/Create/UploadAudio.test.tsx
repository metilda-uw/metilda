import { mount } from "enzyme";
import * as React from "react";
import { expect } from "../setupTests";
import sinon from "sinon";
import UploadAudio from "./UploadAudio";
import { FileEntry } from "../types/types";

// Helpers

function makeFile(overrides: Partial<FileEntry> = {}): FileEntry {
    return {
        index: 0,
        name: "test-file.wav",
        path: "uploads/test-file.wav",
        size: 1024,
        type: "Upload",
        created: "2024-01-01",
        updated: "2024-01-01",
        user: "user@example.com",
        ...overrides,
    };
}

function renderOpen(
    userFiles: FileEntry[],
    extra: Partial<React.ComponentProps<typeof UploadAudio>> = {}
) {
    const wrapper = mount(
        <UploadAudio
            userFiles={userFiles}
            setUploadId={sinon.stub()}
            onFileDeleted={sinon.stub()}
            activeFileNames={[]}
            {...extra}
        />
    );
    wrapper.find(".metilda-custom-select-header").simulate("click");
    return wrapper;
}

// Unit Tests 

describe("UploadAudio delete UI", () => {
    describe("delete button rendering", () => {
        it("renders delete buttons only for Upload entries, not Folder", () => {
            const files: FileEntry[] = [
                makeFile({ name: "audio.wav", type: "Upload" }),
                makeFile({ name: "my-folder", type: "Folder" }),
                makeFile({ name: "another.wav", type: "Upload" }),
            ];
            const wrapper = renderOpen(files);

            const rows = wrapper.find(".metilda-custom-select-row");
            expect(rows).to.have.lengthOf(3);

            // Upload rows have delete buttons
            expect(rows.at(0).find(".metilda-delete-btn")).to.have.lengthOf(1);
            expect(rows.at(2).find(".metilda-delete-btn")).to.have.lengthOf(1);

            // Folder row has no delete button
            expect(rows.at(1).find(".metilda-delete-btn")).to.have.lengthOf(0);

            wrapper.unmount();
        });

        it("renders no delete buttons when file list is empty", () => {
            const wrapper = renderOpen([]);
            expect(wrapper.find(".metilda-delete-btn")).to.have.lengthOf(0);
            wrapper.unmount();
        });

        it("renders no delete buttons when all entries are Folder type", () => {
            const files: FileEntry[] = [
                makeFile({ name: "folder-a", type: "Folder" }),
                makeFile({ name: "folder-b", type: "Folder" }),
            ];
            const wrapper = renderOpen(files);
            expect(wrapper.find(".metilda-delete-btn")).to.have.lengthOf(0);
            wrapper.unmount();
        });
    });

    describe("delete button interaction", () => {
        it("clicking delete calls window.confirm before calling onFileDeleted", () => {
            const callOrder: string[] = [];
            const confirmStub = sinon.stub(window, "confirm").callsFake(() => {
                callOrder.push("confirm");
                return true;
            });
            const onFileDeleted = sinon.stub().callsFake(() => {
                callOrder.push("onFileDeleted");
            });

            try {
                const file = makeFile({ name: "audio.wav", type: "Upload" });
                const wrapper = renderOpen([file], { onFileDeleted });

                wrapper.find(".metilda-delete-btn").first().simulate("click");

                expect(confirmStub.calledOnce).to.equal(true);
                expect(onFileDeleted.calledOnce).to.equal(true);
                expect(callOrder[0]).to.equal("confirm");
                expect(callOrder[1]).to.equal("onFileDeleted");

                wrapper.unmount();
            } finally {
                confirmStub.restore();
            }
        });

        it("cancelling confirm does not call onFileDeleted", () => {
            const confirmStub = sinon.stub(window, "confirm").returns(false);
            const onFileDeleted = sinon.stub();

            try {
                const file = makeFile({ name: "audio.wav", type: "Upload" });
                const wrapper = renderOpen([file], { onFileDeleted });

                wrapper.find(".metilda-delete-btn").first().simulate("click");

                expect(confirmStub.calledOnce).to.equal(true);
                expect(onFileDeleted.called).to.equal(false);

                wrapper.unmount();
            } finally {
                confirmStub.restore();
            }
        });
    });
});
