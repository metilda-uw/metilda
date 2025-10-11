import React, { Component } from 'react';

import $ from "jquery";
import '../Lib/imgareaselect/css/imgareaselect-default.css';
import '../Lib/imgareaselect/scripts/jquery.imgareaselect';
import { AUDIO_IMG_HEIGHT, AUDIO_IMG_WIDTH } from '../constants/create';

// type definitions in order to get imgAreaSelect to work with typescript
declare global {
    interface JQuery {
      imgAreaSelect(options?: ImgAreaSelectOptions): JQuery;
    }
  }

  interface ImgAreaSelectOptions {
    instance?: boolean;
    isSelecting?: boolean;
    handles?: boolean;
    classPrefix?: string;
    resizable?: boolean;
    movable?: boolean;
    parent?: string;
    minHeight?: number;
    maxWidth?: number;
    show?: boolean;
    onInit?: () => void;
    onSelectStart?: (img: HTMLImageElement, loc: ImgAreaSelectSelection) => void;
    onSelectChange?: (img: HTMLImageElement, loc: ImgAreaSelectSelection) => void;
    onSelectEnd?: (img: HTMLImageElement, loc: ImgAreaSelectSelection) => void;
}

interface ImgAreaSelectSelection {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface ImgAreaSelectInstance {
    update?(): void;
    setOptions?(options: ImgAreaSelectOptions): void;
    getOptions?(): ImgAreaSelectOptions;
    setSelection?(x1: number, y1: number, x2: number, y2: number, noPosition?: boolean): void;
    cancelSelection?(): void;
    remove?(): void;
}

interface AudioImgProps {
    uploadId?: string;
    verticalLines?: Array<{ id: string, time: number }>;
    imageWidth?: number;
    xminPerc?: number;
    xmaxPerc?: number;
    minAudioTime?: number;
    maxAudioTime?: number;
    minAudioX?: number;
    maxAudioX?: number;
    tmin?: number;
    tmax?: number;
    spectrogramWidth?: number;
    speakerIndex?: number;
    typeOfBeat?: string;
    beats?: number[];
    src?: string;
    audioIntervalSelected?: (start: number, end: number, verticalLines: Array<{ id: string, time: number }>) => void;
    audioIntervalSelectionCanceled?: () => void;
    showImgMenu?: (x: number, y: number) => void;
    onVerticalLinesUpdate?: (verticalLines: Array<{ id: string, time: number }>) => void;
    onAudioImageLoaded?: (cancelSelection: () => void, selectAudioInterval: (t1: number, t2: number) => void) => void;
}

interface AudioImgState {
    isLoaded?: boolean;
    imgObj?: any;
    verticalLines?: Array<{ id: string, time: number }>;
}

class AudioImg extends Component <AudioImgProps, AudioImgState, JQuery> {
    
    isSelecting: boolean; // present in both AudioImgProps and ImgAreaSelectOptions could be problematic
    metildaAudioAnalysisImageRef: React.RefObject<HTMLImageElement>;

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            imgObj: null,
            verticalLines: this.props.verticalLines || []
        };

        this.timeCoordToImageCoord = this.timeCoordToImageCoord.bind(this);
        this.xCoordToTime = this.xCoordToTime.bind(this);
        this.timeToXCoord = this.timeToXCoord.bind(this);
        this.metildaAudioAnalysisImageRef = React.createRef();
        this.isSelecting = false;
    }
    

    timeCoordToImageCoord(t) {
        let startOffset = this.props.imageWidth * this.props.xminPerc;

        // clip times that lie beyond the image boundaries
        if (t < this.props.minAudioTime) {
            return startOffset;
        } else if (t > this.props.maxAudioTime) {
            return startOffset + this.props.maxAudioX - this.props.minAudioX;
        }

        let dt = this.props.maxAudioTime - this.props.minAudioTime;
        let u0 = (t - this.props.minAudioTime) / dt;

        let dx = this.props.maxAudioX - this.props.minAudioX;

        let x0 = startOffset + u0 * dx;

        return x0
    }

    // Convert audio time (seconds) to an X coordinate (pixels)
    timeToXCoord = (time: number): number => {
        const { minAudioTime, maxAudioTime } = this.props;
        const timePerc = (time - minAudioTime) / (maxAudioTime - minAudioTime); // 0 → 1
        const usablePerc = this.props.xmaxPerc - this.props.xminPerc;
        const xPerc = this.props.xminPerc + timePerc * usablePerc;
        return xPerc * this.props.imageWidth;
    };

    // Convert X coordinate (pixels) back to audio time (seconds)
    xCoordToTime = (x: number): number => {
        const { minAudioTime, maxAudioTime } = this.props;
        const perc = x / this.props.imageWidth;
        const usablePerc = this.props.xmaxPerc - this.props.xminPerc;
        const normPerc = (perc - this.props.xminPerc) / usablePerc;
        return minAudioTime + normPerc * (maxAudioTime - minAudioTime);
    };

    componentWillUnmount() {
        if (this.state.imgObj) {
            this.state.imgObj.remove();
        }
    }

    audioImgId = () => {
        return `imgareaselect-speaker-${this.props.speakerIndex}`;
    }

    updateVerticalLinePositions() {
        this.setState(prevState => ({
            verticalLines: prevState.verticalLines.map(line => ({
                ...line,
                time: this.timeCoordToImageCoord(line.time) // Adjust position based on zoom
            }))
        }));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.minAudioX !== this.props.minAudioX || prevProps.maxAudioX !== this.props.maxAudioX) {
            this.updateVerticalLinePositions();
        }
        
        if (prevProps.verticalLines !== this.props.verticalLines) {
            // Update state when props change
            this.setState({ verticalLines: this.props.verticalLines });
          }
    }

    componentDidMount() {
        const { xminPerc, xmaxPerc } = this.props;

        let audioImage = this;
        let cropAreaLeftX;
        let cropAreaRightX;
        let $el = $(this.metildaAudioAnalysisImageRef.current);
        $el.mousedown(this.onMouseDown);

        let imgBox = { xminPerc, xmaxPerc };
        let prevMaxWidth;
        let isProgrammaticSelection = false;

        window.onresize = function () {
            prevMaxWidth = undefined;
        };

        const audioImgId = this.audioImgId();

        let imgObj: ImgAreaSelectInstance = $el.imgAreaSelect({
            instance: true,
            handles: true,
            classPrefix: audioImgId,
            resizable: false,
            movable: false,
            parent: `#${audioImgId}`,
            onInit: function () {
                $(`.${audioImgId}-selection, ` +
                    `.${audioImgId}-border1, ` +
                    `.${audioImgId}-border2, ` +
                    `.${audioImgId}-border3, ` +
                    `.${audioImgId}-border4, ` +
                    `.${audioImgId}-outer`).mousedown((e) => {
                        e.preventDefault();
                        audioImage.onMouseDown(e)
                    }).contextmenu((e) => e.preventDefault());

                // apply styling to custom imgareaselect divs
                $(`.${audioImgId}-border1`).addClass("imgareaselect-border1");
                $(`.${audioImgId}-border2`).addClass("imgareaselect-border2");
                $(`.${audioImgId}-border3`).addClass("imgareaselect-border3");
                $(`.${audioImgId}-border4`).addClass("imgareaselect-border4");
                $(`.${audioImgId}-outer`).addClass("imgareaselect-outer");

                audioImage.setState({ isLoaded: true, imgObj: imgObj }, function () {
                    imgObj.setOptions({ minHeight: $el.height() });
                });

                audioImage.props.onAudioImageLoaded(imgObj.cancelSelection, function (t1, t2) {
                    isProgrammaticSelection = true;
                    // clear existing selections
                    imgObj.cancelSelection();

                    let leftX = audioImage.timeCoordToImageCoord(t1);
                    let rightX = audioImage.timeCoordToImageCoord(t2);
                    if (leftX < rightX) {
                        // The y1 and y2 values are intentionally set such that the resulting
                        // height of the selection is less than the image height. This is
                        // done on purpose to avoid a weird resize bug that results in the
                        // wrong selection being shown.
                        let y1 = imgObj.getOptions().minHeight * 0.002;
                        let y2 = imgObj.getOptions().minHeight * 0.998;
                        imgObj.setSelection(leftX, y1, rightX, y2, true);
                        imgObj.setOptions({ show: true });
                        imgObj.update();
                    }
                    isProgrammaticSelection = false;
                });
            },
            onSelectStart: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
                if (loc.x1 < imgBox.xminPerc * img.width || loc.x2 > imgBox.xmaxPerc * img.width) {
                    imgObj.cancelSelection();
                } else {
                    cropAreaLeftX = loc.x1;
                    cropAreaRightX = loc.x2;
                }
                this.isSelecting = true;
            },
            onSelectChange: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
                if (cropAreaLeftX !== undefined && cropAreaRightX !== undefined) {
                    let isLeftEdgeMovingLeft = loc.x1 < cropAreaLeftX;
                    let isRightEdgeMovingRight = loc.x2 > cropAreaRightX;
                    let maxWidth;

                    if (isLeftEdgeMovingLeft) {
                        let graphLeftX = imgBox.xminPerc * img.width;
                        maxWidth = loc.x2 - graphLeftX;
                    } else if (isRightEdgeMovingRight) {
                        let graphRightX = imgBox.xmaxPerc * img.width;
                        maxWidth = graphRightX - loc.x1;
                    }

                    // The prevMaxWidth check avoids an infinite loop bug for certain
                    // image sizes.
                    if (maxWidth !== undefined && prevMaxWidth !== maxWidth) {
                        prevMaxWidth = maxWidth;
                        imgObj.setOptions({ maxWidth: maxWidth });
                    }
                }
            },
            onSelectEnd: function (img, loc) {
                if (isProgrammaticSelection) {
                    return;
                }
                cropAreaLeftX = undefined;
                cropAreaRightX = undefined;
            
                if (loc.x1 < loc.x2) {
                    let startOffset = audioImage.props.imageWidth * audioImage.props.xminPerc;
                    let selectedStart = loc.x1 - startOffset;
                    let selectedEnd = loc.x2 - startOffset;
            
                    // Get vertical lines in the selected area
                    const selectedLines = audioImage.state.verticalLines.filter(line => 
                        line.time >= audioImage.xCoordToTime(loc.x1) && line.time <= audioImage.xCoordToTime(loc.x2)
                    );
            
                    audioImage.props.audioIntervalSelected(selectedStart, selectedEnd, selectedLines);
                } else if (loc.x1 === loc.x2) {
                    audioImage.props.audioIntervalSelectionCanceled();
                }
                this.isSelecting = false;
            }
            
        });
    }

    onMouseDown = (event) => {
        if (this.isSelecting) return; // Prevent interaction while selecting
        if (event.which === 1) { // Left click
            if (this.props.typeOfBeat === 'Rhythm') {
                const rect = this.metildaAudioAnalysisImageRef.current.getBoundingClientRect();
                const relativeX = event.clientX - rect.left;
                this.toggleVerticalLine(this.xCoordToTime(relativeX));
            }
        } else if (event.which === 3) { // Right click
            this.props.showImgMenu(event.pageX, event.pageY);
        }
    };

    toggleVerticalLine = (xtime) => {
        this.setState((prevState) => {
          const existingLineIndex = prevState.verticalLines.findIndex(
            (line) => Math.abs(line.time - xtime) < 0.005
          );
      
          let updatedLines;
          if (existingLineIndex !== -1) {
            // Remove the line if it already exists
            updatedLines = prevState.verticalLines.filter(
              (_, index) => index !== existingLineIndex
            );
          } else {
            // Add a new line
            console.log("X %:", xtime / AUDIO_IMG_WIDTH, "X ", xtime);
            const newLine = { id: `line-${Date.now()}`, time: xtime };
            updatedLines = [...prevState.verticalLines, newLine];
          }
      
          // Notify parent component to update state
          this.props.onVerticalLinesUpdate(updatedLines);
          return { verticalLines: updatedLines };
        });
      };
      
      handleDrag = (event, id) => {
        this.setState((prevState) => {
          const updatedLines = prevState.verticalLines.map((line) => {
            if (line.id === id) {
              return { ...line, time: this.xCoordToTime(event.pageX) }; // Update time
            }
            return line;
          });
      
          // Notify parent component to update state
          this.props.onVerticalLinesUpdate(updatedLines);
          return { verticalLines: updatedLines };
        });
      };
    

    renderVerticalLines = () => {
        const { verticalLines, typeOfBeat } = this.props;
        const imageElement = this.metildaAudioAnalysisImageRef.current;
        const imageHeight = imageElement ? imageElement.clientHeight : 0;
        const imageTop = imageElement ? imageElement.offsetTop : 0;
        if (typeOfBeat !== 'Rhythm') return null;
      
        return verticalLines.map((line) => {
            if (line.time >= this.props.minAudioTime && line.time <= this.props.maxAudioTime) {
                return (
                    <div
                        key={line.id}
                        className="draggable-line"
                        style={{
                        left: this.timeToXCoord(line.time) + 'px', // Use x position from state
                        position: 'absolute',
                        top: imageTop + 'px',
                        height: imageHeight + 'px', // Adjust height as needed
                        width: '2px', // Line thickness
                        background: 'yellow', // Line color
                        cursor: 'ew-resize', // Cursor style
                        }}
                        onMouseDown={(e) => this.startDragging(e, line.id)} // Enable dragging
                        onDoubleClick={() => this.toggleVerticalLine(line.time)} // Enable double-click to remove
                    />
                );
            }
        });
      };


      startDragging = (event, id) => {
        event.preventDefault();
        document.onmousemove = (e) => this.handleDrag(e, id);
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };

    render() {
        const { src } = this.props;
        return (
            <div onContextMenu={(e) => e.preventDefault()} style={{ position: 'relative', display: 'inline-block' }}>
                <div id={this.audioImgId()} style={{ position: 'relative' }} >
                    <img id="metilda-audio-analysis-image"
                        ref={this.metildaAudioAnalysisImageRef}
                        className={"metilda-audio-analysis-image " + (this.state.isLoaded ? "" : "hide")}
                        src={src} 
                        onClick={(e) => {
                            const rect = (e.target as HTMLImageElement).getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            console.log("Clicked coords:", x, y);
                            console.log("time: ", this.xCoordToTime(x));
                            console.log("X %:", x / AUDIO_IMG_WIDTH);
                            console.log("Y %:", y / AUDIO_IMG_HEIGHT);
                        }}
                        />
                    {this.renderVerticalLines()}
                </div>

            </div>
        );
    }
}

export default AudioImg;