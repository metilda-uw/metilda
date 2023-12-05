import { Result } from "react-file-reader-input";
import { Speaker } from "../types/types";
import moment from "moment";
import "react-notifications/lib/notifications.css";
import { NotificationManager } from "react-notifications";
import { set } from "react-ga";
import {getLineColors, getDotColors} from '../Designs/pitchArtDesigns';

export function importSpeakerFile(
  results: Result[],
  speakerIndex: number,
  setSpeakerFunc: (speakerIndex: number, speaker: Speaker) => void
) {
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

export function uploadAudio(results: FileList, firebase: any) {
  const filePromise = new Promise((resolve, reject) => {
    if (results.length === 1) {
      const uid = firebase.auth.currentUser.email;
      const file = results[0];
      const blob = new Blob([file], { type: "audio/wav" });
      const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
      const fileName = file.name;
      const storageRef = firebase.uploadFile();
      const filesRef = storageRef.child(
        `${uid}/Uploads/${timeStamp}_${fileName}`
      );
      filesRef
        .put(blob)
        .then((success: any) => {
          const formData = new FormData();
          formData.append("user_id", uid);
          formData.append("file_name", fileName);
          formData.append(
            "file_path",
            `${uid}/Uploads/${timeStamp}_${fileName}`
          );
          formData.append("file_type", "Upload");
          formData.append("file_size", file.size.toString());
          formData.append("number_of_syllables", "0");
          formData.append("recording_word_name", "null");
          formData.append("updated_by", uid);
          fetch(`/api/create-file`, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: formData,
          }).then((response) => {
            NotificationManager.success("Uploaded file successfully!");
            resolve(response);
          });
        })
        .catch((ex: any) => {
          reject(ex);
          NotificationManager.error("Error: File not uploaded");
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
    const filesRef = storageRef.child(
      `${uid}/Recordings/${recordingWordName}/${timeStamp}_${fileName}`
    );
    filesRef.put(result.blob).then((success: any) => {
      const formData = new FormData();
      formData.append("user_id", uid);
      formData.append("file_name", fileName);
      formData.append(
        "file_path",
        `${uid}/Recordings/${recordingWordName}/${timeStamp}_${fileName}`
      );
      formData.append("file_type", "Recording");
      formData.append("file_size", result.blob.size);
      formData.append("number_of_syllables", numberOfSyllables);
      formData.append("recording_word_name", recordingWordName);
      formData.append("updated_by", uid);
      fetch(`/api/create-file`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })
        .then((response) => {
          response.json();
          NotificationManager.success("Uploaded recording successfully!");
          resolve(response);
        })
        .catch((ex: any) => {
          reject(ex);
          NotificationManager.error("Error: Recording not uploaded");
        });
    });
  });
  return filePromise;
}

export function deleteRecording(itemRef: any, firebase: any) {
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
          Accept: "application/json",
        },
        body: formData,
      })
        .then((response) => {
          response.json();
          NotificationManager.success("Deleted recording successfully!");
          resolve(response);
        })
        .catch((ex: any) => {
          reject(ex);
          NotificationManager.error("Error: Recording not deleted");
        });
    });
  });
  return filePromise;
}

export function deleteUser(userId: any, firebase: any) {
  const filePromise = new Promise((resolve, reject) => {
    // const uid = firebase.auth.currentUser.email;
    const formData = new FormData();
    formData.append("user_id", userId);
    fetch(`/api/delete-user`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    }).then((response) => {
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
    const filesRef = storageRef.child(
      `${uid}/Analyses/${timeStamp}_${fileName}`
    );
    filesRef
      .put(
        new Blob([JSON.stringify(metildaWord)], { type: "application/json" })
      )
      .then((success: any) => {
        const formData = new FormData();
        formData.append("file_id", fileIndex.toString());
        formData.append("analysis_file_name", fileName);
        formData.append("uploaded_at", timeStamp);
        formData.append(
          "analysis_file_path",
          `${uid}/Analyses/${timeStamp}_${fileName}`
        );
        fetch(`/api/create-analysis`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            resolve(data.result);
            NotificationManager.success("Uploaded analysis successfully!");
          });
      })
      .catch((ex: any) => {
        reject(ex);
        NotificationManager.error("Error: Analysis not uploaded");
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
    const filesRef = storageRef.child(
      `${uid}/Analyses/${timeStamp}_${fileName}`
    );
    filesRef
      .put(
        new Blob([JSON.stringify(metildaWord)], { type: "application/json" })
      )
      .then((success: any) => {
        const formData = new FormData();
        formData.append(
          "analysis_file_path",
          `${uid}/Analyses/${timeStamp}_${fileName}`
        );
        formData.append("updated_at", timeStamp);
        formData.append("analysis_id", latestAnalysisId.toString());
        fetch(`/api/update-analysis`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            resolve(data.result);
            NotificationManager.success("Updated analysis successfully!");
          });
      })
      .catch((ex: any) => {
        reject(ex);
        NotificationManager.error("Error: Analysis not updated");
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
    const filesRef = storageRef.child(
      `${uid}/Images/${timeStamp}_${imageName}`
    );
    filesRef
      .putString(dataURL, "data_url")
      .then((success: any) => {
        const formData = new FormData();
        formData.append("user_id", `${uid}`);
        formData.append("image_name", `${imageName}`);
        formData.append(
          "image_path",
          `${uid}/Images/${timeStamp}_${imageName}`
        );
        fetch(`/api/create-image`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            resolve(data.result);
            NotificationManager.success("Uploaded image successfully!");
          });
      })
      .catch((ex: any) => {
        reject(ex);
        NotificationManager.error("Error: Image not uploaded");
      });
  });
  return promise;
}

export function uploadThumbnail(
  imageName: string,
  dataURL: any,
  firebase: any
): Promise<number> {
  const promise = new Promise<number>((resolve, reject) => {
    // const uid = firebase.auth.currentUser.email;
    const storageRef = firebase.uploadFile();
    // const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
    const filesRef = storageRef.child(`/thumbnails/${imageName}`);
    filesRef
      .putString(dataURL, "data_url")
      //   .then((success: any) => {
      //     const formData = new FormData();
      //     formData.append("user_id", `${uid}`);
      //     formData.append("image_name", `${imageName}`);
      //     formData.append(
      //       "image_path",
      //       `${uid}/Images/${timeStamp}_${imageName}`
      //     );
      //     fetch(`/api/create-image`, {
      //       method: "POST",
      //       headers: {
      //         Accept: "application/json",
      //       },
      //       body: formData,
      //     })
      //       .then((response) => response.json())
      //       .then((data) => {
      //         resolve(data.result);
      //         NotificationManager.success("Uploaded image successfully!");
      //       });
      //   })
      .catch((ex: any) => {
        reject(ex);
        NotificationManager.error("Error: Image not uploaded");
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
    fetch(`/api/create-image-analysis`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
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

export function uploadEaf(
  fileName: any,
  fileIndex: any,
  fileContent: string,
  firebase: any
): Promise<number> {
  const promise = new Promise<number>((resolve, reject) => {
    const uid = firebase.auth.currentUser.email;
    const storageRef = firebase.uploadFile();
    const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
    const filesRef = storageRef.child(`${uid}/Eafs/${timeStamp}_${fileName}`);
    filesRef
      .put(new Blob([fileContent], { type: "application/xml" }))
      .then((success: any) => {
        const formData = new FormData();
        formData.append("file_id", fileIndex.toString());
        formData.append("eaf_file_name", fileName);
        formData.append("uploaded_at", timeStamp);
        formData.append(
          "eaf_file_path",
          `${uid}/Eafs/${timeStamp}_${fileName}`
        );
        fetch(`/api/create-eaf`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            resolve(data.result);
            NotificationManager.success(
              "Uploaded " + fileName + " successfully!"
            );
          });
      })
      .catch((ex: any) => {
        reject(ex);
        NotificationManager.error("Error: EAF not uploaded");
      });
  });
  return promise;
}

export function AddFolder(folderName: any, firebase: any, uid: any) {
  const filePromise = new Promise((resolve, reject) => {
    const storageRef = firebase.uploadFile();
    const filesRef = storageRef.child(`${uid}/Uploads/${folderName}/.ignore`);
    filesRef
      .getMetadata()
      .then(function () {
        NotificationManager.error(folderName + " already exists!");
      })
      .catch(function () {
        filesRef
          .put(new Blob())
          .then((success: any) => {
            const formData = new FormData();
            formData.append("user_id", uid);
            formData.append("file_name", folderName);
            formData.append("file_path", `${uid}/Uploads/${folderName}`);
            formData.append("file_type", "Folder");
            formData.append("file_size", "0");
            formData.append("updated_by", uid);
            fetch(`/api/create-folder`, {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
              body: formData,
            }).then((response) => {
              NotificationManager.success(
                "Created " + folderName + " successfully!"
              );
              resolve(response);
            });
          })
          .catch((ex: any) => {
            reject(ex);
            NotificationManager.success("Error: Subfolder not uploaded");
          });
      });
  });
  return filePromise;
}

export function MoveToFolder(
  fileId: any,
  filePath: any,
  fileData: any,
  firebase: any
) {
  const filePromise = new Promise((resolve, reject) => {
    const storageRef = firebase.uploadFile();
    const filesRef = storageRef.child(filePath);
    filesRef
      .put(new Blob([fileData], { type: "audio/wav" }))
      .then((success: any) => {
        const formData = new FormData();
        formData.append("file_id", fileId);
        formData.append("file_path", filePath);
        fetch(`/api/move-to-folder`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }).then((response) => {
          resolve(response);
        });
      })
      .catch((ex: any) => {
        reject(ex);
      });
  });
  return filePromise;
}

export function ShareFile(
  audioId: any,
  userId: any,
  permission: string,
  selectedFolderName: any,
  firebase: any
) {
  if (selectedFolderName != "Uploads") {
    AddFolder(selectedFolderName, firebase, userId)
  }
  const formData = new FormData();
  formData.append("audio_id", audioId.toString());
  formData.append("user_id", userId.toString());
  formData.append("permission", permission.toString())
  fetch(`/api/share-file`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  }).then((response) => {
    console.log(response);
  });
}

export function DeleteViewPermission(
  audioId: any,
  userId: any
) {
  const formData = new FormData();
  formData.append("audio_id", audioId.toString());
  formData.append("user_id", userId.toString());
  fetch(`/api/delete-shared-user`, {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body: formData
  }).then((response) => {
    console.log(response);
  });
}


export const chooseColor = (speakers, isLineColor) => {

  let colors = ["gray","green","orange","blue","brown","red"];
  if(isLineColor){
    const colorMap = getLineColors();
    colors = Array.from(colorMap.keys());
  }else{
    const colorMap = getDotColors();
    colors = Array.from(colorMap.keys());
  }

  let usedColors = new Set();
  
  let color = "#000000";

  for(let i=0;i<speakers.length;i++){
    const c = isLineColor ? speakers[i].lineColor : speakers[i].dotColor;
    usedColors.add(c);
  }

  for(let i=0;i<colors.length;i++){
    if(!usedColors.has(colors[i])) return colors[i];
  }

  return color;

}