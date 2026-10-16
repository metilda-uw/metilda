import { NotificationManager } from "react-notifications";
import {
  FILE_NOT_SAVED_MESSAGE,
  RECORDING_NOT_SAVED_MESSAGE,
  UPLOAD_NOT_CONFIRMED_MESSAGE,
  uploadAudio,
  uploadRecording,
} from "./ImportUtils";

// A Storage double: records what was stored and what was deleted.
function fakeFirebase() {
  const stored: string[] = [];
  const deleted: string[] = [];
  return {
    stored,
    deleted,
    auth: { currentUser: { email: "me@example.com" } },
    uploadFile: () => ({
      child: (path: string) => ({
        put: () => {
          stored.push(path);
          return Promise.resolve({});
        },
        delete: () => {
          deleted.push(path);
          return Promise.resolve();
        },
      }),
    }),
  };
}

const wavFile = () => [new File(["RIFF"], "test.wav", { type: "audio/wav" })] as any;

describe("upload helpers report what really happened", () => {
  let success: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    success = jest.spyOn(NotificationManager, "success").mockImplementation(() => undefined);
    error = jest.spyOn(NotificationManager, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uploadAudio shows success when MeTILDA registered the file", async () => {
    (window as any).fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ result: 7 }), { status: 200 }));
    const firebase = fakeFirebase();

    await uploadAudio(wavFile(), firebase);

    expect(success).toHaveBeenCalledWith("Uploaded file successfully!");
    expect(error).not.toHaveBeenCalled();
    expect(firebase.deleted).toEqual([]);
  });

  it("uploadAudio says so and removes the stored copy when the file could not be registered", async () => {
    (window as any).fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "Error: the file could not be registered" }), { status: 500 }));
    const firebase = fakeFirebase();

    await expect(uploadAudio(wavFile(), firebase)).rejects.toThrow("could not be registered");

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(FILE_NOT_SAVED_MESSAGE);
    expect(firebase.deleted).toEqual(firebase.stored);
    expect(firebase.stored).toHaveLength(1);
  });

  it("uploadAudio keeps the stored copy when the server did not answer", async () => {
    (window as any).fetch = jest.fn().mockRejectedValue(new Error("offline"));
    const firebase = fakeFirebase();

    await expect(uploadAudio(wavFile(), firebase)).rejects.toThrow("offline");

    expect(error).toHaveBeenCalledWith(UPLOAD_NOT_CONFIRMED_MESSAGE);
    expect(firebase.deleted).toEqual([]);
  });

  it("uploadRecording says so and removes the stored copy when the recording could not be registered", async () => {
    (window as any).fetch = jest.fn().mockResolvedValue(new Response("{}", { status: 500 }));
    const firebase = fakeFirebase();
    const recording = { blob: new Blob(["RIFF"], { type: "audio/wav" }) };

    await expect(uploadRecording(recording, "rec.wav", 2, "word", firebase)).rejects.toThrow("could not be registered");

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(RECORDING_NOT_SAVED_MESSAGE);
    expect(firebase.deleted).toEqual(firebase.stored);
  });

  it("uploadRecording still shows success when the recording was registered", async () => {
    (window as any).fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ result: 8 }), { status: 200 }));
    const firebase = fakeFirebase();
    const recording = { blob: new Blob(["RIFF"], { type: "audio/wav" }) };

    await uploadRecording(recording, "rec.wav", 2, "word", firebase);

    expect(success).toHaveBeenCalledWith("Uploaded recording successfully!");
    expect(firebase.deleted).toEqual([]);
  });
});
