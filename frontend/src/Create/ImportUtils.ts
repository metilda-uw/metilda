import {Result} from "react-file-reader-input";
import {Speaker} from "../types/types";
import moment from "moment";

export function importSpeakerFile(
    results: Result[],
    speakerIndex: number,
    setSpeakerFunc: (speakerIndex: number, speaker: Speaker) => void) {
    if (results.length === 1) {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const speakerString = JSON.parse(reader.result as string);
            const speaker: Speaker = speakerString as Speaker;
            setSpeakerFunc(speakerIndex, speaker);
        });
        reader.readAsText(results[0][1]);
    }
}

export function uploadAudio(
    results: FileList,
    firebase: any,
    ) {
        const filePromise = new Promise((resolve, reject) => {
            if (results.length === 1) {
                const uid = firebase.auth.currentUser.email;
                const file = results[0];
                const blob = new Blob([file], {type: "audio/wav"});
                const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
                const fileName = file.name;
                const storageRef = firebase.uploadFile();
                const filesRef = storageRef.child(`${uid}/Uploads/${timeStamp}_${fileName}`);
                filesRef.put(blob)
                    .then((success: any) => {
                    const formData = new FormData();
                    formData.append("user_id", uid);
                    formData.append("file_name", fileName);
                    formData.append("file_path", `${uid}/Uploads/${timeStamp}_${fileName}`);
                    formData.append("file_type", "Upload");
                    formData.append("file_size", file.size.toString());
                    formData.append("number_of_syllables", "0");
                    formData.append("recording_word_name", "null");
                    formData.append("updated_by", uid);
                    fetch(`/api/create-file`, {
                      method: "POST",
                      headers: {
                          Accept: "application/json"
                      },
                      body: formData
                  })
                  .then((response) => {
                    window.confirm("Uploaded file successfully!");
                    resolve(response);
                    });
                   })
                   .catch((ex: any) => {
                    reject(ex);
                   });
                 }
        });
        return filePromise;
}

export function uploadRecording(
    result: any,
    fileName: any,
    numberOfSyllables: any,
    recordingWordName: string,
    firebase: any
    ) {
        const filePromise = new Promise((resolve, reject) => {
            const uid = firebase.auth.currentUser.email;
            const storageRef = firebase.uploadFile();
            const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
            const filesRef = storageRef.child(`${uid}/Recordings/${recordingWordName}/${timeStamp}_${fileName}`);
            filesRef.put(result.blob).then((success: any) => {
                const formData = new FormData();
                formData.append("user_id", uid);
                formData.append("file_name", fileName);
                formData.append("file_path", `${uid}/Recordings/${recordingWordName}/${timeStamp}_${fileName}`);
                formData.append("file_type", "Recording");
                formData.append("file_size", result.blob.size);
                formData.append("number_of_syllables", numberOfSyllables);
                formData.append("recording_word_name", recordingWordName);
                formData.append("updated_by", uid);
                fetch(`/api/create-file`, {
                  method: "POST",
                  headers: {
                      Accept: "application/json"
                  },
                  body: formData
              })
              .then((response) => {
                  response.json();
                  window.confirm("Uploaded recording successfully!");
                  resolve(response);
                })
              .catch((ex: any) => {
                    reject(ex);
                   });
               });
        });
        return filePromise;
}

export function deleteRecording(
    itemRef: any,
    firebase: any
    ) {
        const filePromise = new Promise((resolve, reject) => {
            const uid = firebase.auth.currentUser.email;
            itemRef.delete().then((success: any) => {
                const formData = new FormData();
                formData.append("user_id", uid);
                formData.append("file_path", itemRef.location.path);
                formData.append("file_type", "Recording");
                fetch(`/api/delete-recording`, {
                  method: "POST",
                  headers: {
                      Accept: "application/json"
                  },
                  body: formData
              })
              .then((response) => {
                  response.json();
                  window.confirm("Deleted recording successfully!");
                  resolve(response);
                })
              .catch((ex: any) => {
                    reject(ex);
                   });
               });
        });
        return filePromise;
}

export function deleteUser(
    userId: any,
    firebase: any
    ) {
        const filePromise = new Promise((resolve, reject) => {
            const uid = firebase.auth.currentUser.email;
            const formData = new FormData();
            formData.append("user_id", userId);
            fetch(`/api/delete-user`, {
              method: "POST",
              headers: {
                  Accept: "application/json"
              },
              body: formData
          })
          .then((response) => {
              response.json();
              resolve(response);
            });
        });
        return filePromise;
}

export function uploadAnalysis(
    metildaWord: object,
    fileIndex: any,
    fileName: string,
    firebase: any
    ): Promise<number> {
        const promise = new Promise<number>((resolve, reject) => {
        const uid = firebase.auth.currentUser.email;
        const storageRef = firebase.uploadFile();
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        const filesRef = storageRef.child(`${uid}/Analyses/${timeStamp}_${fileName}`);
        filesRef.put(new Blob([JSON.stringify(metildaWord)], {type: "application/json"})).then((success: any) => {
            const formData = new FormData();
            formData.append("file_id", fileIndex.toString());
            formData.append("analysis_file_name", fileName);
            formData.append("uploaded_at", timeStamp);
            formData.append("analysis_file_path", `${uid}/Analyses/${timeStamp}_${fileName}`);
            fetch(`/api/create-analysis`, {
              method: "POST",
              headers: {
                  Accept: "application/json"
              },
              body: formData
          })
            .then((response) => response.json())
            .then((data) => {
                 resolve(data.result);
                 window.confirm("Uploaded analysis successfully!");
              });
        })
        .catch((ex: any) => {
            reject(ex);
           });
    });
        return promise;
}

export function updateAnalysis(
    metildaWord: object,
    fileName: string,
    latestAnalysisId: any,
    firebase: any
    ): Promise<number> {
        const promise = new Promise<number>((resolve, reject) => {
        const uid = firebase.auth.currentUser.email;
        const storageRef = firebase.uploadFile();
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        const filesRef = storageRef.child(`${uid}/Analyses/${timeStamp}_${fileName}`);
        filesRef.put(new Blob([JSON.stringify(metildaWord)], {type: "application/json"})).then((success: any) => {
            const formData = new FormData();
            formData.append("analysis_file_path", `${uid}/Analyses/${timeStamp}_${fileName}`);
            formData.append("updated_at", timeStamp);
            formData.append("analysis_id", latestAnalysisId.toString());
            fetch(`/api/update-analysis`, {
              method: "POST",
              headers: {
                  Accept: "application/json"
              },
              body: formData
          })
            .then((response) => response.json())
            .then((data) => {
                 resolve(data.result);
                 window.confirm("Updated analysis successfully!");
              });
        })
        .catch((ex: any) => {
            reject(ex);
           });
    });
        return promise;
}

export function uploadImage(
    imageName: string,
    dataURL: any,
    firebase: any
    ): Promise<number> {
        const promise = new Promise<number>((resolve, reject) => {
        const uid = firebase.auth.currentUser.email;
        const storageRef = firebase.uploadFile();
        const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
        const filesRef = storageRef.child(`${uid}/Images/${timeStamp}_${imageName}`);
        filesRef.putString(dataURL, "data_url").then((success: any) => {
            const formData = new FormData();
            formData.append("user_id", `${uid}`);
            formData.append("image_name", `${imageName}`);
            formData.append("image_path", `${uid}/Images/${timeStamp}_${imageName}`);
            fetch(`/api/create-image`, {
              method: "POST",
              headers: {
                  Accept: "application/json"
              },
              body: formData
          })
            .then((response) => response.json())
            .then((data) => {
                 resolve(data.result);
                 window.confirm("Uploaded image successfully!");
              });
        })
        .catch((ex: any) => {
            reject(ex);
           });
    });
        return promise;
}

export function uploadImageAnalysisIds(
    imageId: number,
    analysisId: number
    ): Promise<number> {
        const promise = new Promise<number>((resolve, reject) => {
            const formData = new FormData();
            formData.append("image_id", imageId.toString());
            formData.append("analysis_id", analysisId.toString());
            fetch(`/api/insert-image-analysis-ids`, {
              method: "POST",
              headers: {
                  Accept: "application/json"
              },
              body: formData
          })
            .then((response) => response.json())
            .then((data) => {
                resolve(data.result);
             })
        .catch((ex: any) => {
            reject(ex);
           });
    });
        return promise;
}
