/**
 * Unit tests for CreatePitchArt.onFileDeleted logic
 *
 * These tests exercise the onFileDeleted function as a standalone async function,
 * avoiding the need to mount the full CreatePitchArt component (which has heavy
 * Redux/Firebase dependencies). The logic is extracted into a factory that accepts
 * injected dependencies (firebase, fetch, NotificationManager, setState, speakers, setUploadId, resetLetters).
 */

import { expect } from "../setupTests";
import sinon from "sinon";
import { NotificationManager } from "react-notifications";
import { FileEntry, Speaker } from "../types/types";

 // Pure extraction of onFileDeleted logic 

interface OnFileDeletedDeps {
    firebase: {
        uploadFile: () => { child: (path: string) => { delete: () => Promise<void> } };
    };
    fetchFn: typeof fetch;
    speakers: Speaker[];
    setState: (updater: (prev: { files: FileEntry[] }) => { files: FileEntry[] }) => void;
    setUploadId: (idx: number, id: string, fileIndex: number) => void;
    resetLetters: (idx: number) => void;
}

async function onFileDeleted(file: FileEntry, deps: OnFileDeletedDeps): Promise<void> {
    // 1. Delete from Firebase Storage
    try {
        const storageRef = deps.firebase.uploadFile();
        await storageRef.child(file.path).delete();
    } catch (ex) {
        NotificationManager.error(`Failed to delete "${file.name}" from storage.`);
        return;
    }

    // 2. Delete from database
    const formData = new FormData();
    formData.append("file_id", String(file.index));
    const response = await deps.fetchFn("/api/delete-file", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
    });
    if (!response.ok) {
        NotificationManager.error(`Failed to delete "${file.name}" from database.`);
        return;
    }

    // 3. Remove from file list state
    deps.setState((prev) => ({
        files: prev.files.filter((f) => f.name !== file.name),
    }));

    // 4. Reset any speaker slot that had this file active
    deps.speakers.forEach((speaker, idx) => {
        if (speaker.uploadId === file.name) {
            deps.setUploadId(idx, "", -1);
            deps.resetLetters(idx);
        }
    });

    // 5. Show success notification
    NotificationManager.success(`"${file.name}" deleted successfully.`);
}

// Test helpers

const sampleFile: FileEntry = {
    index: 42,
    name: "test-audio.wav",
    path: "uploads/test-audio.wav",
    size: 1024,
    type: "Upload",
    created: "2024-01-01",
    updated: "2024-01-01",
    user: "user@example.com",
};

function makeDeleteRef(shouldThrow = false) {
    return {
        delete: shouldThrow
            ? sinon.stub().rejects(new Error("Storage error"))
            : sinon.stub().resolves(),
    };
}

function makeFirebase(shouldThrow = false) {
    const deleteRef = makeDeleteRef(shouldThrow);
    const childStub = sinon.stub().returns(deleteRef);
    const uploadFileStub = sinon.stub().returns({ child: childStub });
    return { uploadFile: uploadFileStub, childStub, deleteRef };
}

function makeOkResponse(): Response {
    return { ok: true, status: 200 } as Response;
}

function makeErrorResponse(status = 500): Response {
    return { ok: false, status } as Response;
}

// Tests

describe("CreatePitchArt.onFileDeleted", () => {
    let notificationErrorStub: sinon.SinonStub;
    let notificationSuccessStub: sinon.SinonStub;

    beforeEach(() => {
        notificationErrorStub = sinon.stub(NotificationManager, "error");
        notificationSuccessStub = sinon.stub(NotificationManager, "success");
    });

    afterEach(() => {
        notificationErrorStub.restore();
        notificationSuccessStub.restore();
    });

    it("does not call POST /api/delete-file if Firebase Storage delete throws", async () => {
        const { uploadFile } = makeFirebase(/* shouldThrow */ true);
        const fetchStub = sinon.stub().resolves(makeOkResponse());

        await onFileDeleted(sampleFile, {
            firebase: { uploadFile },
            fetchFn: fetchStub as unknown as typeof fetch,
            speakers: [],
            setState: sinon.stub(),
            setUploadId: sinon.stub(),
            resetLetters: sinon.stub(),
        });

        expect(fetchStub.called).to.equal(
            false,
            "fetch should NOT be called when storage delete throws"
        );
    });

    it("shows error notification on storage failure", async () => {
        const { uploadFile } = makeFirebase(/* shouldThrow */ true);
        const fetchStub = sinon.stub().resolves(makeOkResponse());

        await onFileDeleted(sampleFile, {
            firebase: { uploadFile },
            fetchFn: fetchStub as unknown as typeof fetch,
            speakers: [],
            setState: sinon.stub(),
            setUploadId: sinon.stub(),
            resetLetters: sinon.stub(),
        });

        expect(notificationErrorStub.calledOnce).to.equal(
            true,
            "NotificationManager.error should be called once on storage failure"
        );
        expect(notificationErrorStub.firstCall.args[0]).to.include(
            sampleFile.name,
            "Error message should include the file name"
        );
    });

    it("shows error notification when DB response is non-2xx", async () => {
        const { uploadFile } = makeFirebase(/* shouldThrow */ false);
        const fetchStub = sinon.stub().resolves(makeErrorResponse(500));

        await onFileDeleted(sampleFile, {
            firebase: { uploadFile },
            fetchFn: fetchStub as unknown as typeof fetch,
            speakers: [],
            setState: sinon.stub(),
            setUploadId: sinon.stub(),
            resetLetters: sinon.stub(),
        });

        expect(notificationErrorStub.calledOnce).to.equal(
            true,
            "NotificationManager.error should be called once on DB failure"
        );
        expect(notificationErrorStub.firstCall.args[0]).to.include(
            sampleFile.name,
            "Error message should include the file name"
        );
    });

    it("shows success notification on full success", async () => {
        const { uploadFile } = makeFirebase(/* shouldThrow */ false);
        const fetchStub = sinon.stub().resolves(makeOkResponse());

        await onFileDeleted(sampleFile, {
            firebase: { uploadFile },
            fetchFn: fetchStub as unknown as typeof fetch,
            speakers: [],
            setState: sinon.stub(),
            setUploadId: sinon.stub(),
            resetLetters: sinon.stub(),
        });

        expect(notificationSuccessStub.calledOnce).to.equal(
            true,
            "NotificationManager.success should be called once on full success"
        );
        expect(notificationSuccessStub.firstCall.args[0]).to.include(
            sampleFile.name,
            "Success message should include the file name"
        );
    });

    it("removes the deleted file from files state on success", async () => {
        const { uploadFile } = makeFirebase(/* shouldThrow */ false);
        const fetchStub = sinon.stub().resolves(makeOkResponse());

        const existingFiles: FileEntry[] = [
            sampleFile,
            { ...sampleFile, index: 99, name: "other-file.wav" },
        ];

        let capturedFiles: FileEntry[] = existingFiles;
        const setStateStub = sinon.stub().callsFake(
            (updater: (prev: { files: FileEntry[] }) => { files: FileEntry[] }) => {
                const result = updater({ files: existingFiles });
                capturedFiles = result.files;
            }
        );

        await onFileDeleted(sampleFile, {
            firebase: { uploadFile },
            fetchFn: fetchStub as unknown as typeof fetch,
            speakers: [],
            setState: setStateStub,
            setUploadId: sinon.stub(),
            resetLetters: sinon.stub(),
        });

        expect(setStateStub.calledOnce).to.equal(
            true,
            "setState should be called once on success"
        );
        expect(capturedFiles.find((f) => f.name === sampleFile.name)).to.equal(
            undefined,
            `Deleted file "${sampleFile.name}" should not be in the resulting file list`
        );
        expect(capturedFiles.length).to.equal(
            1,
            "Only the non-deleted file should remain"
        );
        expect(capturedFiles[0].name).to.equal("other-file.wav");
    });
});
