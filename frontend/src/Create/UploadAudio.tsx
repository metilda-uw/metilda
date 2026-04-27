import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolder, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FileEntry } from '../types/types';
import './UploadAudio.css';

interface UploadAudioProps {
    initFileName?: string;
    userFiles?: FileEntry[];
    setUploadId?: (name: string, path: string, index: number, type: string) => void;
    firebase?: any;
    onFileDeleted?: (file: FileEntry) => void;
    activeFileNames?: string[];
    selectedFolderName?: string;
    onBackClick?: () => void;
}

interface UploadAudioState {
    updateCounter?: number;
    selectedFileName?: string;
    isOpen: boolean;
}

class UploadAudio extends Component<UploadAudioProps, UploadAudioState> {
    private dropdownRef: React.RefObject<HTMLDivElement>;

    constructor(props: UploadAudioProps) {
        super(props);
        this.state = {
            updateCounter: 0,
            selectedFileName: this.props.initFileName || '',
            isOpen: false,
        };

        this.sendFormSubmit = this.sendFormSubmit.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.dropdownRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    componentDidUpdate(prevProps: UploadAudioProps) {
        if (prevProps.initFileName !== this.props.initFileName) {
            this.setState({ selectedFileName: this.props.initFileName || '' });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    handleOutsideClick(event: MouseEvent) {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target as Node)) {
            this.setState({ isOpen: false });
        }
    }

    sendFormSubmit(file: FileEntry) {
        if (this.props.initFileName) {
            const isOk = window.confirm(
                'Selecting a new file/folder will reload the page, do you want to continue?'
            );
            if (!isOk) {
                this.setState({ updateCounter: this.state.updateCounter + 1 });
                return;
            }
        }

        this.props.setUploadId(file.name, file.path, file.index, file.type);
        this.setState({ selectedFileName: file.name, isOpen: false });
    }

    handleDeleteClick = (e: React.MouseEvent, file: FileEntry) => {
        e.stopPropagation();
        const activeFileNames = this.props.activeFileNames || [];
        const isActive = activeFileNames.includes(file.name);
        const message = isActive
            ? `"${file.name}" is currently loaded in a speaker slot. Delete it anyway?`
            : `Are you sure you want to delete "${file.name}"?`;
        if (!window.confirm(message)) {
            return;
        }
        if (this.props.onFileDeleted) {
            this.props.onFileDeleted(file);
        }
    }

    toggleDropdown = () => {
        this.setState(prev => ({ isOpen: !prev.isOpen }));
    }

    render() {
        const { userFiles } = this.props;
        const { selectedFileName, isOpen } = this.state;

        const displayName = selectedFileName || 'Choose audio file';

        const { selectedFolderName, onBackClick } = this.props;

        return (
            <div className="upload-audio-wrapper">
                {onBackClick !== undefined && (
                    <div id="metilda-drop-down-back-button">
                        {selectedFolderName === 'Uploads' ? (
                            <button className="audioBackButtonDisabled" disabled={true} title="Go to parent directory">
                                <i className="material-icons">arrow_back</i>
                            </button>
                        ) : (
                            <button className="audioBackButton" onClick={onBackClick} title="Go to parent directory">
                                <i className="material-icons">arrow_back</i>
                            </button>
                        )}
                    </div>
                )}
                <div
                    className="metilda-audio-analysis-controls-list-item col s12"
                    key={this.state.updateCounter}
                    ref={this.dropdownRef}
                >
                <label className="group-label">Audio File</label>
                <div className="metilda-custom-select">
                    <div
                        className="metilda-custom-select-header"
                        onClick={this.toggleDropdown}
                        role="button"
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                    >
                        <span className="metilda-custom-select-value">{displayName}</span>
                        <FontAwesomeIcon icon={faChevronDown} className="metilda-custom-select-arrow" />
                    </div>
                    {isOpen && (
                        <ul className="metilda-custom-select-list" role="listbox">
                            {userFiles && userFiles.map((file, index) => (
                                <li
                                    key={index}
                                    className={`metilda-custom-select-row${file.name === selectedFileName ? ' selected' : ''}`}
                                    onClick={() => this.sendFormSubmit(file)}
                                    role="option"
                                    aria-selected={file.name === selectedFileName}
                                >
                                    {file.type === 'Folder' ? (
                                        <>
                                            <FontAwesomeIcon icon={faFolder} className="metilda-folder-icon" />
                                            <span className="metilda-file-name">{file.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="metilda-file-name">{file.name}</span>
                                            <button
                                                className="metilda-delete-btn"
                                                aria-label={`Delete ${file.name}`}
                                                onClick={(e) => this.handleDeleteClick(e, file)}
                                                type="button"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                </div>
            </div>
        );
    }
}

export default UploadAudio;
