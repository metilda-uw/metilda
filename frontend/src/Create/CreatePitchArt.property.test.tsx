import * as fc from "fast-check";
import { expect } from "../setupTests";
import { FileEntry, Speaker } from "../types/types";

// Arbitraries

const fileEntryArb = fc.record({
    index: fc.nat(),
    name: fc.string({ minLength: 1 }),
    path: fc.string(),
    size: fc.nat(),
    type: fc.oneof(fc.constant("Upload" as const), fc.constant("Folder" as const)),
    created: fc.string(),
    updated: fc.string(),
    user: fc.string(),
});

const speakerArb = (uploadId?: fc.Arbitrary<string>) =>
    fc.record({
        uploadId: uploadId ?? fc.string(),
        letters: fc.constant([] as import("../types/types").Letter[]),
    });

// Pure logic extracted from CreatePitchArt.onFileDeleted

function applyFileDeletion(files: FileEntry[], deletedFile: FileEntry): FileEntry[] {
    return files.filter((f) => f.name !== deletedFile.name);
}

function applySlotReset(
    speakers: Speaker[],
    deletedFileName: string
): Speaker[] {
    return speakers.map((s) =>
        s.uploadId === deletedFileName ? { ...s, uploadId: "" } : { ...s }
    );
}

describe("Successful deletion removes exactly the deleted file from the list", () => {
    it("result has no entry with the deleted file's name; length equals N minus count of same-named files", () => {
        fc.assert(
            fc.property(
                fc.array(fileEntryArb, { minLength: 1 }),
                fc.integer({ min: 0 }),
                (files, idx) => {
                    const targetFile = files[idx % files.length];
                    const result = applyFileDeletion(files, targetFile);

                    // No entry with the deleted file's name should remain
                    const remaining = result.find((f) => f.name === targetFile.name);
                    expect(remaining).to.equal(
                        undefined,
                        `Expected no file named "${targetFile.name}" to remain after deletion`
                    );

                    // Length should equal N minus the count of files sharing the same name
                    const sameNameCount = files.filter(
                        (f) => f.name === targetFile.name
                    ).length;
                    expect(result.length).to.equal(
                        files.length - sameNameCount,
                        `Expected result length ${files.length - sameNameCount}, got ${result.length}`
                    );
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe("Non-active file deletion preserves all speaker slot selections", () => {
    it("all speaker uploadId values are unchanged when no slot matches the deleted file", () => {
        fc.assert(
            fc.property(
                // Generate a deleted file name
                fc.string({ minLength: 1 }),
                // Generate speakers whose uploadId is guaranteed NOT to match the deleted file name
                fc.array(
                    fc.string({ minLength: 1 }).chain((id) =>
                        speakerArb(fc.constant(id))
                    ),
                    { minLength: 1 }
                ),
                (deletedFileName, speakers) => {
                    // Filter out any speaker that accidentally has the same uploadId
                    // (fast-check may generate collisions; we constrain by assumption)
                    fc.pre(speakers.every((s) => s.uploadId !== deletedFileName));

                    const result = applySlotReset(speakers, deletedFileName);

                    speakers.forEach((speaker, i) => {
                        expect(result[i].uploadId).to.equal(
                            speaker.uploadId,
                            `Speaker slot ${i} uploadId should be unchanged: expected "${speaker.uploadId}", got "${result[i].uploadId}"`
                        );
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe("Active file deletion resets the affected speaker slot", () => {
    it("matching slots have uploadId === '' and non-matching slots are unchanged", () => {
        fc.assert(
            fc.property(
                // Generate a deleted file name
                fc.string({ minLength: 1 }),
                // Generate at least one speaker that DOES match the deleted file name
                fc.array(speakerArb(), { minLength: 1 }),
                fc.integer({ min: 0 }),
                (deletedFileName, speakers, matchIdx) => {
                    // Force at least one speaker to match the deleted file name
                    const targetIdx = matchIdx % speakers.length;
                    const speakersWithMatch: Speaker[] = speakers.map((s, i) =>
                        i === targetIdx ? { ...s, uploadId: deletedFileName } : s
                    );

                    const result = applySlotReset(speakersWithMatch, deletedFileName);

                    speakersWithMatch.forEach((speaker, i) => {
                        if (speaker.uploadId === deletedFileName) {
                            expect(result[i].uploadId).to.equal(
                                "",
                                `Speaker slot ${i} should be reset to "" but got "${result[i].uploadId}"`
                            );
                        } else {
                            expect(result[i].uploadId).to.equal(
                                speaker.uploadId,
                                `Speaker slot ${i} should be unchanged: expected "${speaker.uploadId}", got "${result[i].uploadId}"`
                            );
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});
