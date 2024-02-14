import React, { createRef } from "react"
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Modal from 'react-modal'
import draftToHtml from 'draftjs-to-html';
import "../GeneralStyles.scss"
import { getFile, getFileSrcDict, onDownloadFiles, onDownloadFilesFromSource, removeFileWrapper } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import { verifyTeacherCourse } from "../../AuthUtils";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { uploadFileWrapper } from "../Utils";
import ReactFileReader from "react-file-reader";
// import PitchBlock from "./PitchBlock";
import { FileDrop } from 'react-file-drop'
import CreatePitchArtBlock from "./CreatePitchArtBlock";
import BlockWordCard from "./BlockWordCard";
import PitchArtblock from "./PitchArtBlock";

// const 

export function Lesson() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const lessonId = useParams()['lesson_id']
    const [title,setTitle] = useState('')
    const [content, setContent] = useState([])
    const [newContent, setNewContent] = useState('')
    const blockList=content
    // const blockList = JSON.parse(content)
    const [available, setAvailable] = useState('loading')
    const firebase = useContext(FirebaseContext)
    const downloadRef = createRef<HTMLAnchorElement>();
    const [status, setStatus] = useState('view')
    const [blockEditing, setBlockEditing] = useState('')
    const [fileSrcDict, setFileSrcDict] = useState({})
    const [fileName, setfileName] = useState('') //file to upload
    const [uploadFiles, setUploadFiles] = useState();
    const [newTitle, setNewTitle] = useState('')
    const [newAvailable, setNewAvailable] = useState('loading')
    const [showModal, setShowModal] = useState(false)
    const [newPitchArt, setNewPitchArt] = useState('')
    const [veri, setVeri] = useState(true)
    const [loading,setLoading]=useState(true)

    const history = useHistory()

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('lesson', lessonId);
            try {
                let response = await fetch('/cms/lessons/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setNewTitle(response['name'])
                setContent(response['content'])
                setAvailable(response['available'] ? '1' : '0')
                setNewAvailable(response['available'] ? '1' : '0')
                let temp=[]
                for (let x in response['content']) {
                    temp.push(0)
                }
                setBlockEditing(temp.join(','))

                let temp2 = {}
                for (let x of response['content']) {
                    if (x.type === 'image' || x.type === 'file' || x.type === 'audio' || x.type === 'video') {
                        await getFileSrcDict(firebase,temp2,x.id,`/cms/lesson/block/file/read/${courseId}/lesson-block/${x.id}`)
                    }
                }
                setFileSrcDict(temp2)
            }
            catch { }
            setLoading(false)
        }
        if (user) {
            fetchData()
        }
    },[user,])

    if(document.getElementsByClassName('App').length)
        Modal.setAppElement('.App')
    
    const customStyles = {
        overlay: {
            position: 'fix',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
        },
    };
    
    function handleOnDragEnd(result) {
        if (!result.destination) return;
    
        const items = Array.from(content);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
    
        setContent(items);
    }

    
    async function onSave() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('blocks', JSON.stringify(blockList.map((block, index) => {
            block['index'] = index
            return block
        })));

        try {
            await fetch('/cms/lesson/blocks/reorganize', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }
    }

    async function onCreateText() {
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        formData.append('index', content.length.toString());
        formData.append('type', 'text');
        formData.append('content', JSON.stringify(newContent));

        try {
            await fetch('/cms/lesson/blocks/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }

        formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            let response = await fetch('/cms/lessons/read', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            setTitle(response['name'])
            setNewTitle(response['name'])
            setContent(response['content'])
            setAvailable(response['available'] ? '1' : '0')
            setNewAvailable(response['available'] ? '1' : '0')
        }
        catch { }
    }



    async function onDeleteText(index,e) {
        let temp = e.target.name

        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('block', temp);
        try {
            await fetch('/cms/lesson/blocks/delete', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }

        content.splice(index, 1)
        setContent(content)
        let temp2 = blockEditing.split(',')
        temp2.splice(index, 1)
        setBlockEditing(temp2.join(','))
    }

    async function onEditBlock(e) {
        let index = +e.target.name
        setStatus('edit-block')
        let temp = blockEditing.split(',')
        temp[index] = '1'
        setBlockEditing(temp.join(','))
    }

    async function onUpdateText(index, e) {
        let blockId=e.target.name
        content[index].content=JSON.stringify(newContent)
        setContent(content)

        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('block', blockId);
        formData.append('content', JSON.stringify(newContent));
        try {
            await fetch('/cms/lesson/blocks/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }
    }


    async function onSelectFile(selectedFiles) {
        const filePromise = new Promise(async (resolve, reject) => {
            if (selectedFiles.length === 1) {
                setUploadFiles(selectedFiles)
                const file = selectedFiles[0];
                setfileName(file.name);
            }
        });
        return filePromise;
    }


    const uploadHandler = async (para_files: any,blockId) => {
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'lesson-block','','/cms/lesson/block/file',{'block':blockId});
        } catch (ex) {
          console.log(ex);
        }
    }

    const removeHandler = async (path) => {
        try {
          await removeFileWrapper(firebase, path,'/cms/lesson/block/file');
        } catch (ex) {
          console.log(ex);
        }
    }

    async function onCreateFile(fileType) {
        let blockId=''
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        formData.append('index', content.length.toString());
        formData.append('type', fileType);
        formData.append('content', fileName);
        try {
            let response=await fetch('/cms/lesson/blocks/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            blockId=response['id']
        }
        catch (ex) {
            console.log(ex);
        }

        try {
            if (uploadFiles) {
                await uploadHandler(uploadFiles,blockId);
            }
        } catch (ex) {
            console.log(ex);
        }


        formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            let response = await fetch('/cms/lessons/read', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            setTitle(response['name'])
            setNewTitle(response['name'])
            setContent(response['content'])
            setAvailable(response['available'] ? '1' : '0')
            setNewAvailable(response['available'] ? '1' : '0')
            let temp2 = {}
            for (let x of response['content']) {
                if (x.type === 'image' || x.type === 'file' || x.type === 'audio' || x.type === 'video') {
                    await getFileSrcDict(firebase,temp2,x.id,`/cms/lesson/block/file/read/${courseId}/lesson-block/${x.id}`)
                }
            }
            setFileSrcDict(temp2)
        }
        catch {}
    }


    async function onDeleteFile(index,e) {
        let blockId = e.target.name

        let response = await fetch(
            `/cms/lesson/block/file/read/${courseId}/lesson-block/${blockId}`,
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

        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('block', blockId);
        try {
            await fetch('/cms/lesson/blocks/delete', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log(error)
        }
        await removeHandler(path)
        
        content.splice(index, 1)
        setContent(content)
        let temp = blockEditing.split(',')
        temp.splice(index, 1)
        setBlockEditing(temp.join(','))
    }


    async function onUpdateFile(index, e) {
        let blockId = e.target.name
        let response = await fetch(
            `/cms/lesson/block/file/read/${courseId}/lesson-block/${blockId}`,
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

        
        try {
            if (uploadFiles) {
                await removeHandler(path)
                await uploadHandler(uploadFiles,blockId);
            }
        } catch (ex) {
            console.log(ex);
        }

        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('block', blockId);
        formData.append('content', fileName);
        try {
            await fetch('/cms/lesson/blocks/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (ex) {
            console.log(ex);
        }

        formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            let response = await fetch('/cms/lessons/read', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            setTitle(response['name'])
            setNewTitle(response['name'])
            setContent(response['content'])
            setAvailable(response['available'] ? '1' : '0')
            setNewAvailable(response['available'] ? '1' : '0')
            let temp2 = {}
            for (let x of response['content']) {
                if (x.type === 'image' || x.type === 'file' || x.type === 'audio' || x.type === 'video') {
                    await getFileSrcDict(firebase,temp2,x.id,`/cms/lesson/block/file/read/${courseId}/lesson-block/${x.id}`)
                }
            }
            setFileSrcDict(temp2)
        }
        catch {}

    }


    async function onCreatePitchArt() {
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        formData.append('index', content.length.toString());
        formData.append('type', 'pitchart');
        formData.append('content', newPitchArt);

        try {
            await fetch('/cms/lesson/blocks/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log(error)
        }

        // setShowPitchartModal(false)
        // resetPitchartStates()

        formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            let response = await fetch('/cms/lessons/read', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            setTitle(response['name'])
            setNewTitle(response['name'])
            setContent(response['content'])
            setAvailable(response['available'] ? '1' : '0')
            setNewAvailable(response['available'] ? '1' : '0')
        }
        catch { }

    }

    function resetStates() {
        setNewTitle(newTitle)
        setNewAvailable(available)
    }

    // function resetPitchartStates() {
    //     setNewPitchart('')
    // }

    async function onUpdateLesson(e) {
        e.preventDefault()
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        formData.append('name', newTitle)
        formData.append('available', newAvailable)
        try {
            await fetch('/cms/lessons/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch { }
        
        setShowModal(false)
        resetStates()

        formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            let response = await fetch('/cms/lessons/read', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response = await response.json()
            setTitle(response['name'])
            setNewTitle(response['name'])
            setAvailable(response['available'] ? '1' : '0')
            setNewAvailable(response['available'] ? '1' : '0')
        }
        catch { }
    }

    async function onDeleteLesson() {
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('lesson', lessonId);
        try {
            await fetch('/cms/lessons/delete', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch { }
        
        history.push('/content-management/course/'+courseId+'/lessons')
    }

    // function makeClassParams(block){
    //     return {
    //         pitchArtId: block.content.split(' ')[0],
    //         pitchArtType: block.content.split(' ')[1],
    //         firebase: firebase || undefined,
    //         history: history,
    //     }
    // }

    // function makeProps(wordId){
    //     return {
    //         pitchart: wordId,
    //         firebase: firebase || undefined,
    //         history: history || undefined,
    //         location: undefined,
    //         match: undefined,
    //     };
    // }
    // <div><PitchBlock {...makeProps(block.content)}></PitchBlock></div>

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view centered">
                    <div className="info-list">
                        <div className='title'>{title}</div>
                        <div>{available === 'loading' ? null : <div><b>Available:</b> {available === '1' ? 'Yes' : 'No'}</div>}</div>

                        {blockList.length ?
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <Droppable droppableId="blocks">
                                    {(provided) => (
                                        <div className="blocks" {...provided.droppableProps} ref={provided.innerRef}>
                                            {blockList.map((block, index) => {
                                                if (block.type === 'text') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(block.content)) }}></div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteText(index, e)}>Delete</button>
                                                                            <button key={index} name={index.toString()} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={onEditBlock}>Edit</button>
                                                                        </div>
                                                                    : null}
                                                                    {blockEditing.split(',')[index] === '1' ?
                                                                        <div>
                                                                            <Editor
                                                                                initialContentState={JSON.parse(block.content)}
                                                                                onContentStateChange={setNewContent}
                                                                                wrapperClassName="editor-wrapper"
                                                                                editorClassName="editor-content"
                                                                                toolbarClassName="editor-toolbar"
                                                                                stripPastedStyles={true}
                                                                            >
                                                                            </Editor>
                                                                            <div>
                                                                                <button key={block.id + 1} name={block.id} className='btn waves-light globalbtn' onClick={(e) => {
                                                                                    onUpdateText(+index, e)
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Save</button>
                                                                                <button key={block.id + 2} className='btn waves-light globalbtn' onClick={() => {
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                    : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                                else if (block.type === 'image') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <div style={{ 'textAlign': 'center' }}><img src={fileSrcDict[block.id]} alt="Loading"></img></div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteFile(index, e)}>Delete</button>
                                                                            <button key={index} name={index.toString()} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={onEditBlock}>Edit</button>
                                                                        </div>
                                                                        : null}
                                                                    {blockEditing.split(',')[index] === '1' ?
                                                                        <div>
                                                                            Image File: {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                                                            <ReactFileReader
                                                                                fileTypes={["image/*"]}
                                                                                multipleFiles={false}
                                                                                handleFiles={onSelectFile}
                                                                            >
                                                                                <button className='btn waves-light globalbtn'>Choose Image File</button>
                                                                            </ReactFileReader>
                                                                            <FileDrop
                                                                                onDrop={onSelectFile}
                                                                            >
                                                                                Drop file here
                                                                            </FileDrop>
                                                                            <div>
                                                                                <button className='btn waves-light globalbtn' key={block.id + 1} name={block.id} onClick={(e) => onUpdateFile(index, e)}>Update</button>
                                                                                <button key={block.id + 2} className='btn waves-light globalbtn' onClick={() => {
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                        : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                                else if (block.type === 'pitchart') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    {/* <div>PitchArt ID:{block.content}</div> */}
                                                                    {/*<div><PitchArtBlock {...makeClassParams(block)}></PitchArtBlock> </div>*/}
                                                                    <div><PitchArtblock collectionUUID={block.content.split(' ')[0]} wordId={block.content.split(' ')[1]}></PitchArtblock> </div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteText(index, e)}>Delete</button>
                                                                        </div>
                                                                    : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                                else if (block.type === 'file') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <a className="hide" ref={downloadRef} target="_blank">
                                                                        Hidden Download Link
                                                                    </a>

                                                                    <div><b>File:</b> <u className="download-link" onClick={() => onDownloadFilesFromSource(fileSrcDict[block.id],block.content,downloadRef)}>{fileSrcDict[block.id]?block.content:'Loading...'}</u></div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteFile(index, e)}>Delete</button>
                                                                            <button key={index} name={index.toString()} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={onEditBlock}>Edit</button>
                                                                        </div>
                                                                        : null}
                                                                    {blockEditing.split(',')[index] === '1' ?
                                                                        <div>
                                                                            File: {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                                                            <ReactFileReader
                                                                                fileTypes={["*"]}
                                                                                multipleFiles={false}
                                                                                handleFiles={onSelectFile}
                                                                            >
                                                                                <button className='btn waves-light globalbtn'>Choose File</button>
                                                                            </ReactFileReader>
                                                                            <FileDrop
                                                                                onDrop={onSelectFile}
                                                                            >
                                                                                Drop file here
                                                                            </FileDrop>
                                                                            <div>
                                                                                <button className='btn waves-light globalbtn' key={block.id + 1} name={block.id} onClick={(e) => onUpdateFile(index, e)}>Update</button>
                                                                                <button key={block.id + 2} className='btn waves-light globalbtn' onClick={() => {
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                        : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                                else if (block.type === 'audio') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <div style={{ 'textAlign': 'center' }}><audio src={fileSrcDict[block.id]} controls></audio></div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteFile(index, e)}>Delete</button>
                                                                            <button key={index} name={index.toString()} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={onEditBlock}>Edit</button>
                                                                        </div>
                                                                        : null}
                                                                    {blockEditing.split(',')[index] === '1' ?
                                                                        <div>
                                                                            <b>Audio File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                                                            <ReactFileReader
                                                                                fileTypes={["audio/*"]}
                                                                                multipleFiles={false}
                                                                                handleFiles={onSelectFile}
                                                                            >
                                                                                <button className='btn waves-light globalbtn'>Choose Audio File</button>
                                                                            </ReactFileReader>
                                                                            <FileDrop
                                                                                onDrop={onSelectFile}
                                                                            >
                                                                                Drop file here
                                                                            </FileDrop>
                                                                            <div>
                                                                                <button className='btn waves-light globalbtn' key={block.id + 1} name={block.id} onClick={(e) => onUpdateFile(index, e)}>Update</button>
                                                                                <button key={block.id + 2} className='btn waves-light globalbtn' onClick={() => {
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                        : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                                else if (block.type === 'video') {
                                                    return (
                                                        <Draggable isDragDisabled={status !== 'edit'} key={block.id} draggableId={block.id} index={index}>
                                                            {(provided) => (
                                                                <div className="lesson-block" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <div style={{ 'textAlign': 'center' }}><video className="lesson-video" src={fileSrcDict[block.id]} controls></video></div>
                                                                    {status === 'edit' || status === 'edit-block' ?
                                                                        <div>
                                                                            <button key={block.id} name={block.id} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={(e) => onDeleteFile(index, e)}>Delete</button>
                                                                            <button key={index} name={index.toString()} className='btn waves-light globalbtn' disabled={status === 'edit-block'} onClick={onEditBlock}>Edit</button>
                                                                        </div>
                                                                        : null}
                                                                    {blockEditing.split(',')[index] === '1' ?
                                                                        <div>
                                                                            <b>Video File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                                                            <ReactFileReader
                                                                                fileTypes={["video/*"]}
                                                                                multipleFiles={false}
                                                                                handleFiles={onSelectFile}
                                                                            >
                                                                                <button className='btn waves-light globalbtn'>Choose Video File</button>
                                                                            </ReactFileReader>
                                                                            <FileDrop
                                                                                onDrop={onSelectFile}
                                                                            >
                                                                                Drop file here
                                                                            </FileDrop>
                                                                            <div>
                                                                                <button className='btn waves-light globalbtn' key={block.id + 1} name={block.id} onClick={(e) => onUpdateFile(index, e)}>Update</button>
                                                                                <button key={block.id + 2} className='btn waves-light globalbtn' onClick={() => {
                                                                                    let temp = []
                                                                                    for (let x in content) {
                                                                                        temp.push(0)
                                                                                    }
                                                                                    setBlockEditing(temp.join(','))
                                                                                    setStatus('edit')
                                                                                }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                        : null}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }
                                            })
                                            }
                                            
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        :null}
                        
                        
                        {status === 'create-text' ?
                        <div>
                            <Editor
                                onContentStateChange={setNewContent}
                                wrapperClassName="editor-wrapper"
                                editorClassName="editor-content"
                                toolbarClassName="editor-toolbar"
                                stripPastedStyles={true}
                            >
                            </Editor>
                            <div>
                                <button className='btn waves-light globalbtn' onClick={onCreateText}>Create</button>
                                <button className='btn waves-light globalbtn' onClick={()=>setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>
                        :null}

                                               
                        {status === 'create-image' ?
                        <div>
                            <b>Image File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                            <ReactFileReader
                                fileTypes={["image/*"]}
                                multipleFiles={false}
                                handleFiles={onSelectFile}
                            >
                                <button className='btn waves-light globalbtn'>Choose Image File</button>
                            </ReactFileReader>
                            <FileDrop
                                onDrop={onSelectFile}
                            >
                                Drop file here
                            </FileDrop>
                            <div>
                                <button className='btn waves-light globalbtn' onClick={()=>onCreateFile('image')}>Create</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>
                        : null} 
                        
                        {status === 'create-file' ?
                        <div>
                            <b>File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                            <ReactFileReader
                                fileTypes={["*"]}
                                multipleFiles={false}
                                handleFiles={onSelectFile}
                            >
                                <button className='btn waves-light globalbtn'>Choose File</button>
                            </ReactFileReader>
                            <FileDrop
                                onDrop={onSelectFile}
                            >
                                Drop file here
                            </FileDrop>
                            <div>
                                <button className='btn waves-light globalbtn' onClick={()=>onCreateFile('file')}>Create</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>
                        : null} 
                        
                        {status === 'create-audio' ?
                        <div>
                            <b>Audio File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                            <ReactFileReader
                                fileTypes={["audio/*"]}
                                multipleFiles={false}
                                handleFiles={onSelectFile}
                            >
                                <button className='btn waves-light globalbtn'>Choose Audio File</button>
                            </ReactFileReader>
                            <FileDrop
                                onDrop={onSelectFile}
                            >
                                Drop file here
                            </FileDrop>
                            <div>
                                <button className='btn waves-light globalbtn' onClick={()=>onCreateFile('audio')}>Create</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>
                        : null}

                        {status === 'create-video' ?
                        <div>
                            <b>Video File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                            <ReactFileReader
                                fileTypes={["video/*"]}
                                multipleFiles={false}
                                handleFiles={onSelectFile}
                            >
                                <button className='btn waves-light globalbtn'>Choose Video File</button>
                            </ReactFileReader>
                            <FileDrop
                                onDrop={onSelectFile}
                            >
                                Drop file here
                            </FileDrop>
                            <div>
                                <button className='btn waves-light globalbtn' onClick={()=>onCreateFile('video')}>Create</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>
                        : null}

                        {status === 'create-pitchart' ?
                        <div>
                            <div>
                                <CreatePitchArtBlock setPitchArt={setNewPitchArt}></CreatePitchArtBlock>
                            </div>
                                <div><button className='btn waves-light globalbtn' onClick={onCreatePitchArt}>Create</button></div>
                                <div><button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </div>
                        </div>

                        : null}

                        <Link className="content-link" to={'/content-management/course/'+courseId+'/lessons'}>Back</Link>
                    </div>

                    <div className="float-right">
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)} disabled={status !== 'view'}>Update lesson</button>
                            <button className='btn waves-light globalbtn' onClick={onDeleteLesson} disabled={status !== 'view'}>Delete lesson</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-text') }} disabled={(status !== 'view')||loading}>Create text blocks</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-image'); setUploadFiles(undefined); setfileName('') }} disabled={(status !== 'view')||loading}>Create image blocks</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-file'); setUploadFiles(undefined); setfileName('')}} disabled={(status !== 'view')||loading}>Create file blocks</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-audio'); setUploadFiles(undefined); setfileName('')}} disabled={(status !== 'view')||loading}>Create audio blocks</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-video'); setUploadFiles(undefined); setfileName('')}} disabled={(status !== 'view')||loading}>Create video blocks</button>
                        </div>
                        <div>
                            <button className='btn waves-light globalbtn' onClick={() => { setStatus('create-pitchart') }} disabled={(status !== 'view')||loading}>Create PitchArt blocks</button>
                        </div>
                        <div>
                            {
                                status==='edit' || status==='edit-block'?
                                <button className='btn waves-light globalbtn' onClick={() => { onSave();setStatus('view') }} disabled={status!=='edit'}>Save</button>
                                :
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('edit')} disabled={(status!=='view')||loading}>Edit</button>
                            }
                        </div>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Update a lesson</div>
                            <form onSubmit={onUpdateLesson}>
                                <div>Lesson name: <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required maxLength={30}></input></div>
                                <div>Available: <input type='checkbox' checked={newAvailable==='1'?true:false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position':'unset' }} onChange={(e) => setNewAvailable(e.target.checked?'1':'0')}></input></div>
                                <div><button type='submit' className='btn waves-light globalbtn'>Update</button></div>
                                <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                            </form>
                        </Modal>

                        {/* <Modal
                            isOpen={showPitchartModal}
                            onRequestClose={() => { setShowPitchartModal(false); resetPitchartStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            Create a Pitchart block
                            <form>
                                <div>Upload ID: <input value={newPitchart} onChange={(e) => setNewPitchart(e.target.value)}></input></div>
                            </form>
                            <div><button className='btn waves-light globalbtn' onClick={onCreatePitchart}>Create</button></div>
                            <div><button className='btn waves-light globalbtn' onClick={() => { setShowPitchartModal(false); resetPitchartStates();setStatus('view') }}>Cancel</button></div>
                        </Modal> */}
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Lesson as any) as any;