import moment from "moment";

export async function getSyllabusFile(firebase,setFiles,courseId){
  try {
    // Get files of a user
    const response = await fetch(
      `/file/read/${courseId}/${'syllabus'}`,
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


export async function uploadFileWrapper(results: FileList, setFiles, firebase: any, courseId, fileType, oldPath) {
    const filePromise = new Promise(async (resolve, reject) => {
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
        await filesRef
          .put(blob)
          .then((success: any) => {
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
            fetch(`/file/create`, {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
              body: formData,
            });
          })
        
        if (oldPath !== '') {
          const deleteRef = storageRef.child(oldPath);
          await deleteRef
            .delete()
            .then((success: any) => {
              const formData = new FormData();
              formData.append("old_path", oldPath);
              fetch(`/file/delete`, {
                method: "POST",
                headers: {
                  Accept: "application/json",
                },
                body: formData,
              });
            });
        }

        window.location.reload()
      }
    });
    return filePromise;
}


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