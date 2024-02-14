import moment from "moment";

export async function uploadFileWrapper(results: FileList, setFiles, firebase: any, courseId, fileType, oldPath, fetchDir='/file',additionalFields={}) {
  // const filePromise = new Promise(async (resolve, reject) => {
    if (results.length === 1) {
      const uid = firebase.auth.currentUser.email;
      const file = results[0];
      const blob = new Blob([file]);
      const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
      const fileName = file.name;
      const storageRef = firebase.uploadFile();
      const filesRef = storageRef.child(
        `${uid}/${courseId}/${fileType}/${timeStamp}_${fileName}`
      );
      await filesRef.put(blob)
        .then(async (success: any) => {
          const formData = new FormData();
          formData.append("user_id", uid);
          formData.append("file_name", fileName);
          formData.append(
            "file_path",
            `${uid}/${courseId}/${fileType}/${timeStamp}_${fileName}`
          );
          formData.append("course", courseId);
          formData.append("file_type", fileType);
          formData.append("file_size", file.size.toString());
          if (additionalFields) {
            for (let key in additionalFields)
              formData.append(key, additionalFields[key]);
          }
          await fetch(fetchDir+`/create`, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: formData,
          });
        })
      
      if (oldPath !== '') {
        const deleteRef = storageRef.child(oldPath);
        await deleteRef.delete()
          .then(async (success: any) => {
            const formData = new FormData();
            formData.append("old_path", oldPath);
            if (additionalFields) {
              for (let key in additionalFields)
                formData.append(key, additionalFields[key]);
            }
            await fetch(fetchDir+`/delete`, {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
              body: formData,
            });
          });
      }
    }
  // });
  // return filePromise;
}


export async function uploadFileBlobWrapper(para_blob, firebase: any, courseId, fileType, oldPath, fetchDir='/file',additionalFields={}) {
  const uid = firebase.auth.currentUser.email;
  const blob = new Blob([para_blob]);
  const timeStamp = moment().format("MM-DD-YYYY_hh_mm_ss");
  const storageRef = firebase.uploadFile();
  const fileName='blob'
  const filesRef = storageRef.child(
    `${uid}/${courseId}/${fileType}/${timeStamp}_${fileName}`
  );
  await filesRef.put(blob)
    .then(async (success: any) => {
      const formData = new FormData();
      formData.append("user_id", uid);
      formData.append("file_name", fileName);
      formData.append(
        "file_path",
        `${uid}/${courseId}/${fileType}/${timeStamp}_${fileName}`
      );
      formData.append("course", courseId);
      formData.append("file_type", fileType);
      formData.append("file_size", blob.size.toString());
      if (additionalFields) {
        for (let key in additionalFields)
          formData.append(key, additionalFields[key]);
      }
      await fetch(fetchDir+`/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
    })
  
  if (oldPath !== '') {
    const deleteRef = storageRef.child(oldPath);
    await deleteRef.delete()
      .then(async (success: any) => {
        const formData = new FormData();
        formData.append("old_path", oldPath);
        if (additionalFields) {
          for (let key in additionalFields)
            formData.append(key, additionalFields[key]);
        }
        await fetch(fetchDir+`/delete`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });
      });
  }
}

export async function getFile(firebase,setFiles,fetchUrl){
  try {
    const response = await fetch(
      fetchUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    let body = await response.json();
    setFiles(body.result.map(file => {
      return {
        user_id: file[0],
        name: file[1],
        path: file[2],
        type: file[3],
        size: file[4]
      }
    }))

  } catch (ex) {
    console.log(ex);
  }
};

// export async function getFileDict(fileDict,fetchUrl){
//   try {
//     const response = await fetch(
//       fetchUrl,
//       {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     let body = await response.json();

//     fileDict[''] {
//       user_id: file[0],
//       name: file[1],
//       path: file[2],
//       type: file[3],
//       size: file[4]
//     }

//   } catch (ex) {
//     console.log(ex);
//   }
// };

export async function getFileSrcDict(firebase,fileSrcDict,id,fetchUrl){
  try {
    let response = await fetch(
      fetchUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    let body = await response.json();
    let file = body
    let path = file[2]
    const storageRef = firebase.uploadFile();
    const url = await storageRef.child(path).getDownloadURL();
    response = await fetch(url);
    const data = await response.blob();
    fileSrcDict[id]=URL.createObjectURL(data);

  } catch (ex) {
    console.log(ex);
  }
};

export async function onDownloadFiles(files,downloadRef,firebase){
    try {
        for (const file of files) {
            // Download file from cloud
          const filePath = file.path;
          const storageRef = firebase.uploadFile();
          const url = await storageRef.child(filePath).getDownloadURL();
          const response = await fetch(url);
          const data = await response.blob();
          downloadRef.current!.href = URL.createObjectURL(data);
          downloadRef.current!.download = file.name;
          downloadRef.current!.click();
        }
    } catch (ex) {
        console.log(ex);
    }
};

export async function onDownloadFilesFromSource(src,fileName,downloadRef){
  try {
    downloadRef.current!.href = src
    downloadRef.current!.download = fileName;
    downloadRef.current!.click();
  } catch (ex) {
    console.log(ex);
  }
};

export async function removeFileWrapper(firebase: any, oldPath, fetchDir,additionalFields={}) {
  // const filePromise = new Promise(async (resolve, reject) => {
    const storageRef = firebase.uploadFile();
    const deleteRef = storageRef.child(oldPath);
    await deleteRef.delete()
      .then(async (success: any) => {
        const formData = new FormData();
        formData.append("old_path", oldPath);
        if (additionalFields) {
          for (let key in additionalFields)
            formData.append(key, additionalFields[key]);
        }
        await fetch(fetchDir+`/delete`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });
      });
  // });
  // return filePromise;
}