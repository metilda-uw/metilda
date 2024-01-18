export async function verifyTeacher(user,setVeri) {
    const formData = new FormData();
    formData.append('user', user);
    try {
        let response = await fetch('/cms/authentication/verification/teacher', {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        })
        response = await response.json()
        if (Object.keys(response).length === 0) {
            setVeri(false)
        }
            
    }
    catch (error) {
        console.log("Fetch failed, see if it is 403 in error console")
    }
}

export async function verifyTeacherCourse(user,course,setVeri) {
    const formData = new FormData();
    formData.append('user', user);
    formData.append('course', course);
    try {
        let response = await fetch('/cms/authentication/verification/teacher_course', {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        })
        response = await response.json()
        if (Object.keys(response).length === 0) {
            setVeri(false)
        }
            
    }
    catch (error) {
        console.log("Fetch failed, see if it is 403 in error console")
    }

}

export async function verifyStudent(user,setVeri) {
    const formData = new FormData();
    formData.append('user', user);
    try {
        let response = await fetch('/cms/authentication/verification/student', {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        })
        response = await response.json()
        if (Object.keys(response).length === 0) {
            setVeri(false)
        }
            
    }
    catch (error) {
        console.log("Fetch failed, see if it is 403 in error console")
    }
}

export async function verifyStudentCourse(user,course,setVeri) {
    const formData = new FormData();
    formData.append('user', user);
    formData.append('course', course);
    try {
        let response = await fetch('/cms/authentication/verification/student_course', {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        })
        response = await response.json()
        if (Object.keys(response).length === 0) {
            setVeri(false)
        }
            
    }
    catch (error) {
        console.log("Fetch failed, see if it is 403 in error console")
    }
}
