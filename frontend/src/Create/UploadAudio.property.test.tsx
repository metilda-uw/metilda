import * as fc from "fast-check";
import { mount } from "enzyme";
import * as React from "react";
import { expect } from "../setupTests";
import sinon from "sinon";
import UploadAudio from "./UploadAudio";
import { FileEntry } from "../types/types";

// Arbitrary for a full FileEntry with a given type
const fileEntryArb = (type?: "Upload" | "Folder") =>
    fc.record({
        name: fc.string({ minLength: 1 }),
        type: type
            ? fc.constant(type)
            : fc.oneof(fc.constant("Upload" as const), fc.constant("Folder" as const)),
        path: fc.string(),
        index: fc.nat(),
        size: fc.nat(),
        created: fc.string(),
        updated: fc.string(),
        user: fc.string(),
    });

// Helper: render UploadAudio with the dropdown open
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
    // Open the dropdown so the list is rendered
    wrapper.find(".metilda-custom-select-header").simulate("click");
    return wrapper;
}

describe("Delete controls appear iff Upload", () => {
    it("every Upload entry has a delete button; no Folder entry has one", () => {
        fc.assert(
            fc.property(fc.array(fileEntryArb()), (files) => {
                const wrapper = renderOpen(files);

                files.forEach((file, i) => {
                    const rows = wrapper.find(".metilda-custom-select-row");
                    const row = rows.at(i);
                    const hasDeleteBtn = row.find(".metilda-delete-btn").length > 0;

                    if (file.type === "Upload") {
                        expect(hasDeleteBtn).to.equal(
                            true,
                            `Upload file "${file.name}" at index ${i} should have a delete button`
                        );
                    } else {
                        expect(hasDeleteBtn).to.equal(
                            false,
                            `Folder "${file.name}" at index ${i} should NOT have a delete button`
                        );
                    }
                });

                wrapper.unmount();
            }),
            { numRuns: 100 }
        );
    });
});

describe("Cancellation is a no-op", () => {
    it("onFileDeleted is never called when window.confirm returns false", () => {
        const confirmStub = sinon.stub(window, "confirm").returns(false);
        try {
            fc.assert(
                fc.property(
                    fc.array(fileEntryArb("Upload"), { minLength: 1 }),
                    fc.integer({ min: 0 }),
                    (files, idx) => {
                        const onFileDeleted = sinon.stub();
                        const wrapper = renderOpen(files, { onFileDeleted });

                        const targetIndex = idx % files.length;
                        const deleteButtons = wrapper.find(".metilda-delete-btn");
                        if (deleteButtons.length > targetIndex) {
                            deleteButtons.at(targetIndex).simulate("click");
                        }

                        expect(onFileDeleted.called).to.equal(false);
                        wrapper.unmount();
                    }
                ),
                { numRuns: 100 }
            );
        } finally {
            confirmStub.restore();
        }
    });
});

describe("In-use warning in confirm message", () => {
    it("confirm message contains in-use warning when file is active", () => {
        fc.assert(
            fc.property(fileEntryArb("Upload"), (file) => {
                let capturedMessage = "";
                const confirmStub = sinon.stub(window, "confirm").callsFake((msg?: string) => {
                    capturedMessage = msg || "";
                    return false;
                });

                try {
                    const wrapper = renderOpen([file], {
                        activeFileNames: [file.name],
                    });

                    const deleteBtn = wrapper.find(".metilda-delete-btn").first();
                    if (deleteBtn.exists()) {
                        deleteBtn.simulate("click");
                        expect(capturedMessage).to.match(
                            /currently (in use|loaded)/i,
                            `Expected confirm message to warn about in-use file, got: "${capturedMessage}"`
                        );
                    }

                    wrapper.unmount();
                } finally {
                    confirmStub.restore();
                }
            }),
            { numRuns: 100 }
        );
    });
});

describe("Aria-label contains file name", () => {
    it("each delete button aria-label contains the corresponding file name", () => {
        fc.assert(
            fc.property(
                fc.array(fileEntryArb("Upload"), { minLength: 1 }),
                (files) => {
                    const wrapper = renderOpen(files);
                    const deleteButtons = wrapper.find(".metilda-delete-btn");

                    files.forEach((file, i) => {
                        const btn = deleteButtons.at(i);
                        const ariaLabel = btn.prop("aria-label") as string;
                        expect(ariaLabel).to.include(
                            file.name,
                            `Delete button at index ${i} aria-label should contain "${file.name}", got "${ariaLabel}"`
                        );
                    });

                    wrapper.unmount();
                }
            ),
            { numRuns: 100 }
        );
    });
});
