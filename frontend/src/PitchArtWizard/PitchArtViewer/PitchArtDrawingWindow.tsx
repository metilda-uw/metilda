import React, { createRef } from "react";
import Konva from "konva";
import { Layer, Line, Rect, Stage } from "react-konva";
import * as Tone from "tone";
import { Encoding } from "tone";
import moment from "moment";
import { connect } from "react-redux";
import { Letter, Speaker } from "../../types/types";
import "./PitchArt.css";
import PitchArtCoordConverter from "./PitchArtCoordConverter";
import PitchArtCoordinateSystem from "./PitchArtCoordinateSystem";
import PitchArtGeometry from "./PitchArtGeometry";
import PitchArtLegend from "./PitchArtLegend";
import PitchArtMetildaWatermark from "./PitchArtMetildaWatermark";
import { PitchArtWindowConfig, RawPitchValue } from "./types";
import UserPitchView from "./UserPitchView";
import {
  uploadAnalysis,
  uploadThumbnail,
  uploadImage,
  uploadImageAnalysisIds,
} from "../../Create/ImportUtils";
import { ThunkDispatch } from "redux-thunk";
import { AppState } from "../../store/index";
import { AudioAction } from "../../store/audio/types";
import { setLatestAnalysisId } from "../../store/audio/actions";
import ReactGA from "react-ga";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { NotificationManager } from "react-notifications";
import PitchArtContextMenu from "./PitchArtContextMenu";

export interface PitchArtDrawingWindowProps {
  speakers: Speaker[];
  width: number;
  height: number;
  minPitch: number;
  maxPitch: number;
  minTime: number;
  maxTime: number;
  fileName: string;
  setLetterPitch: (
    speakerIndex: number,
    letterIndex: number,
    newPitch: number
  ) => void;
  showDynamicContent: boolean;
  showArtDesign: boolean;
  showPitchArtLines: boolean;
  showLargeCircles: boolean;
  averageDotSize?: "S" | "M" | "L";
  contourDotSize?: "S" | "M" | "L";
  showVerticallyCentered: boolean;
  showAccentPitch: boolean;
  showSyllableText: boolean;
  showTimeNormalization: boolean;
  showPitchScale: boolean;
  showPerceptualScale: boolean;
  showPitchArtImageColor: boolean;
  showPrevPitchValueLists: boolean;
  showMetildaWatermark: boolean;
  rawPitchValueLists?: RawPitchValue[][];
  firebase: any;
  isLearn?: boolean;
  setLatestAnalysisId: (
    speakerIndex: number,
    latestAnalysisId: number,
    latestAnalysisName: string,
    lastUploadedLetters: Letter[]
  ) => void;
  ref: any;
}

type MergedIndexesMap = {
  [letterIndex: number]: {
    anchorSpeakerIndex: number;
  };
};

interface State {
  activePlayIndex: number;
  activePlaySpeakerIndex: number;
  showNewImageModal: boolean;
  currentImageName: string;
  allAnalysisIds: any[];
  [key: string]: any;

   // Context menu
  contextMenuVisible: boolean;
  contextMenuX: number;
  contextMenuY: number;
  contextMenuSpeakerIndex: number | null;
  contextMenuLetterIndex: number | null;

  // Secondary accent per speaker: speakerIndex -> letterIndex
  secondaryAccentBySpeaker: { [speakerIndex: number]: number };
  mergedIndexes: MergedIndexesMap;

  // Speaker visibility: indices of speakers whose pitch art is hidden
  hiddenSpeakerIndices: number[];
}

export interface ColorScheme {
  windowLineStrokeColor: string;
  lineStrokeColor: string;
  praatDotFillColor: string;
  activePlayColor: string;
  manualDotFillColor: string;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}
const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

/**
 * NOTE: There are a number of places throughout this component that
 * have not fully been converted over to TypeScript, these areas
 * are marked with "// @ts-ignore". These are functional parts of
 * the code, they just don't have explicit types yet.
 */
export class PitchArtDrawingWindow extends React.Component<
  PitchArtDrawingWindowProps,
  State
> {
  private readonly innerWidth: number;
  private readonly innerHeight: number;
  private readonly pointDx0: number;
  private readonly pointDy0: number;
  private readonly innerBorderX0: number;
  private readonly innerBorderY0: number;
  private readonly graphWidth: number;
  private readonly borderWidth: number;
  private readonly smallCircleRadius: number;
  private readonly largeCircleRadius: number;
  private readonly circleStrokeWidth: number;
  private readonly accentedCircleRadius: number;
  private readonly pitchArtSoundLengthSeconds: number;
  private readonly fontSize: number;
  private downloadRef = createRef<HTMLAnchorElement>();
  private stageRef = createRef<Konva.Stage>();

  constructor(props: PitchArtDrawingWindowProps) {
    super(props);
    this.state = {
      activePlayIndex: -1,
      activePlaySpeakerIndex: -1,
      showNewImageModal: false,
      allAnalysisIds: [],
      currentImageName: "",
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuSpeakerIndex: null,
      contextMenuLetterIndex: null,
      secondaryAccentBySpeaker: {},
      mergedIndexes: {},
      hiddenSpeakerIndices: [],
    };
    this.saveImage = this.saveImage.bind(this);
    this.playPitchArt = this.playPitchArt.bind(this);
    this.playSound = this.playSound.bind(this);
    this.imageBoundaryClicked = this.imageBoundaryClicked.bind(this);
    this.setPointerEnabled = this.setPointerEnabled.bind(this);

    this.innerWidth = this.props.width * 0.75;
    this.innerHeight = this.props.height * 0.8;
    this.pointDx0 = (this.props.width - this.innerWidth) / 2.0;
    this.pointDy0 = (this.props.height - this.innerHeight) / 2.0;

    this.innerBorderX0 = (this.props.width - this.props.width * 0.999) / 2.0;
    this.innerBorderY0 = (this.props.height - this.props.height * 0.999) / 2.0;

    this.graphWidth = 10;
    this.borderWidth = 15;
    this.smallCircleRadius = 8;
    this.largeCircleRadius = 18;
    this.circleStrokeWidth = 10;
    this.accentedCircleRadius = 30;
    this.pitchArtSoundLengthSeconds = 0.2;
    this.fontSize = 16;
  }

  private resolveDotRadius = (
    size: "S" | "M" | "L" | undefined,
    fallback: "S" | "M" | "L"
  ): number => {
    const effective = size || fallback;
    switch (effective) {
      case "S": return 8;
      case "M": return 14;
      case "L": return 20;
    }
  }

  handlePlaySpeakerEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && typeof detail.speakerIndex === "number") {
      this.playPitchArt(detail.speakerIndex);
    }
  };

  componentDidMount() {
    const stage = this.stageRef.current;
    if (stage) {
      const container = stage.getStage().container();
      container.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
    if (this.props.showDynamicContent) {
      document.addEventListener("pitchArtPlaySpeaker", this.handlePlaySpeakerEvent);
    }
  }

  componentWillUnmount() {
    if (this.props.showDynamicContent) {
      document.removeEventListener("pitchArtPlaySpeaker", this.handlePlaySpeakerEvent);
    }
  }

  downloadImage = () => {
    // @ts-ignore
    const dataURL = this.stageRef.current!.getStage().toDataURL();
    this.downloadRef.current!.href = dataURL;
    this.downloadRef.current!.download = this.props.fileName;
    this.downloadRef.current!.click();
  };

  handleCloseImageModal = () => {
    this.setState({
      currentImageName: "",
      showNewImageModal: false,
    });
  };
  onChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  saveNewImageModal = () => {
    return (
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={this.state.showNewImageModal}
        onClose={this.handleCloseImageModal}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          onClose={this.handleCloseImageModal}
          id="form-dialog-title"
        >
          Enter image name
          <br />
          (Supported Formats: png)
        </DialogTitle>
        <DialogContent>
          <input
            className="imageName"
            name="currentImageName"
            value={this.state.currentImageName}
            onChange={this.onChange}
            type="text"
            placeholder={'Ex: "Image1.png" or "Image1"'}
            required
          />
        </DialogContent>
        <DialogActions>
          <button
            className="SaveImage waves-effect waves-light btn globalbtn"
            onClick={this.uploadImage}
          >
            <i className="material-icons right">cloud_upload</i>
            Save
          </button>
        </DialogActions>
      </Dialog>
    );
  };

  evalFileName = (name: string): string => {
    const startsWithDot: boolean = name.startsWith(".");
    const isEmpty: boolean = name.length === 0;
    const tooManyDots: boolean = name.indexOf(".") !== name.lastIndexOf(".");
    const invalidFileFormat: boolean =
      name.includes(".") && name.slice(name.indexOf(".")) !== ".png";

    const baseMessage: string = "Image not uploaded. ";
    if (startsWithDot) {
      return baseMessage + "File name cannot start with a '.'";
    } else if (isEmpty) {
      return baseMessage + "Image name is missing";
    } else if (tooManyDots) {
      return (
        baseMessage +
        "Image name can only have one dot to specify file extension"
      );
    } else if (invalidFileFormat) {
      return baseMessage + "Unsupported file format";
    } else {
      return "ok";
    }
  };

  uploadImage = async () => {
    // follows example from:
    // https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
    // @ts-ignore (TypeScript doesn't like the toDataURL call below, but it works fine)
    const dataURL = this.stageRef.current!.getStage().toDataURL();
    this.setState({
      showNewImageModal: false,
    });

    const fileStatus: string = this.evalFileName(this.state.currentImageName);
    if (fileStatus === "ok") {
      const updatedImageName = this.state.currentImageName.trim();
      const imageId = await uploadImage(
        `${updatedImageName}`,
        dataURL,
        this.props.firebase
      );
      if (typeof imageId === "number") {
        for (const id of this.state.allAnalysisIds) {
          const imageAnalysisId = await uploadImageAnalysisIds(imageId, id);
        }
      }
    } else {
      NotificationManager.error(fileStatus);
    }
    this.setState({
      currentImageName: "",
    });
  };

  uploadImageWithId = async (id) => {
    // follows example from:
    // https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
    // @ts-ignore (TypeScript doesn't like the toDataURL call below, but it works fine)

    const dataURL = this.stageRef.current!.getStage().toDataURL();
    const imageId = await uploadThumbnail(
      `${id}`,
      dataURL,
      this.props.firebase
    );

    // if (fileStatus === "ok") {
    //   const imageId = await uploadImage(
    //     `${id}`,
    //     dataURL,
    //     this.props.firebase
    //   );
    //   if (typeof imageId === "number") {
    //     for (const id of this.state.allAnalysisIds) {
    //       const imageAnalysisId = await uploadImageAnalysisIds(imageId, id);
    //     }
    //   }
    // } else {
    //   NotificationManager.error(fileStatus);
    // }
  };

  saveImage = async () => {
    ReactGA.event({
      category: "Save Image",
      action: "User pressed Save Image button",
    });
    const speakerIndicesForUnsavedAnalysis: number[] = [];
    const allAnalysisIds: number[] = [];
    this.props.speakers.forEach((item, index) => {
      if (
        item.letters.length > 0 &&
        JSON.stringify(item.letters) !==
          JSON.stringify(item.lastUploadedLetters)
      ) {
        speakerIndicesForUnsavedAnalysis.push(index);
      } else if (
        item.letters.length > 0 &&
        JSON.stringify(item.letters) ===
          JSON.stringify(item.lastUploadedLetters)
      ) {
        if (
          item.latestAnalysisId !== null &&
          item.latestAnalysisId !== undefined
        ) {
          allAnalysisIds.push(item.latestAnalysisId);
        }
      }
    });
    if (speakerIndicesForUnsavedAnalysis.length !== 0) {
      NotificationManager.error(
        "Please save all the analyses before saving the image."
      );
    } else {
      this.setState({
        showNewImageModal: true,
        allAnalysisIds,
      });
    }
  };

  saveImageforLearn = async () => {
    ReactGA.event({
      category: "Save Image",
      action: "User pressed Save Image button",
    });
    const speakerIndicesForUnsavedAnalysis: number[] = [];
    const allAnalysisIds: number[] = [];
    this.props.speakers.forEach((item, index) => {
      if (
        item.letters.length > 0 &&
        JSON.stringify(item.letters) !==
          JSON.stringify(item.lastUploadedLetters)
      ) {
        speakerIndicesForUnsavedAnalysis.push(index);
      } else if (
        item.letters.length > 0 &&
        JSON.stringify(item.letters) ===
          JSON.stringify(item.lastUploadedLetters)
      ) {
        if (
          item.latestAnalysisId !== null &&
          item.latestAnalysisId !== undefined
        ) {
          allAnalysisIds.push(item.latestAnalysisId);
        }
      }
    });
    this.setState({
      showNewImageModal: true,
      allAnalysisIds,
    });
  };

  playPitchArt(targetSpeakerIndex?: number) {
    const hidden = this.state.hiddenSpeakerIndices || [];
    const visibleSpeakers: Array<{ speakerIndex: number; letters: Letter[] }> =
      targetSpeakerIndex !== undefined
        ? (this.props.speakers[targetSpeakerIndex] &&
           this.props.speakers[targetSpeakerIndex].letters.length > 0
            ? [{
                speakerIndex: targetSpeakerIndex,
                letters: this.props.speakers[targetSpeakerIndex].letters,
              }]
            : [])
        : this.props.speakers
            .map((sp, i) => ({ speakerIndex: i, letters: sp.letters }))
            .filter(({ speakerIndex, letters }) =>
              !hidden.includes(speakerIndex) && letters.length > 0
            );

    if (visibleSpeakers.length === 0) {
      return;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();

    const env = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.001,
      sustain: 0.001,
      release: 0.001,
    }).toMaster();

    const filter = new Tone.Filter({
      type: "highpass",
      frequency: 50,
      rolloff: -48,
    }).toMaster();

    const synth = new Tone.Synth().toMaster().chain(filter, env);

    const showTimeNormalization = this.props.showTimeNormalization;

    interface PitchArtNote {
      time: number;
      index: number;
      speakerIndex: number;
      duration: number;
      pitch: number;
    }

    const SPEAKER_GAP_SECONDS = 0.4;
    const notes: PitchArtNote[] = [];
    let cumulativeOffset = 0;

    for (const sp of visibleSpeakers) {
      const letters = sp.letters;
      const tStart = letters[0].t0;
      const tEnd = letters[letters.length - 1].t1;
      const totalDuration = tEnd - tStart;
      const n = letters.length;

      letters.forEach((item, index) => {
        const time = showTimeNormalization && n > 1
          ? (index / (n - 1)) * totalDuration
          : item.t0 - tStart;
        const duration = showTimeNormalization
          ? Math.min(0.2, totalDuration / Math.max(1, n))
          : item.t1 - item.t0;
        notes.push({
          time: cumulativeOffset + time,
          duration,
          pitch: item.pitch,
          index,
          speakerIndex: sp.speakerIndex,
        });
      });

      const speakerEndTime = showTimeNormalization && n > 1 ? totalDuration : tEnd - tStart;
      cumulativeOffset += speakerEndTime + SPEAKER_GAP_SECONDS;
    }

    notes.push({
      time: cumulativeOffset,
      duration: 1,
      pitch: 1,
      index: -1,
      speakerIndex: -1,
    });

    const controller = this;

    // @ts-ignore
    const midiPart = new Tone.Part(function (
      time: Encoding.Time,
      note: PitchArtNote
    ) {
      controller.setState({
        activePlayIndex: note.index,
        activePlaySpeakerIndex: note.speakerIndex,
      });
      if (note.index !== -1) {
        synth.triggerAttackRelease(note.pitch, note.duration, time);
      }
      // @ts-ignore
    },
    notes).start();

    Tone.Transport.start();
  }

  playPitchArtRhythm() {
    if (this.props.speakers.length !== 1) {
      return;
    }

    const letters: Letter[] = this.props.speakers[0].letters;
    const env = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.001,
      sustain: 0.001,
      release: 0.001,
    }).toMaster();

    const filter = new Tone.Filter({
      type: "highpass",
      frequency: 50,
      rolloff: -48,
    }).toMaster();

    // var synth = new window.Tone.Synth().toMaster().chain(filter, env);
    const synth = new Tone.Synth().toMaster().chain(filter, env);

    const tStart = letters.length > 0 ? letters[0].t0 : 0;
    const tEnd = letters.length > 0 ? letters[letters.length - 1].t1 : 0;
    const totalDuration = tEnd - tStart;
    const n = letters.length;
    const showTimeNormalization = this.props.showTimeNormalization;

    interface PitchArtNote {
      time: number;
      index: number;
      duration: number;
      pitch: number;
    }

    const notes = letters.map((item, index) => {
      const time = showTimeNormalization && n > 1
        ? (index / (n - 1)) * totalDuration
        : item.t0 - tStart;
      const duration = showTimeNormalization
        ? Math.min(0.2, totalDuration / Math.max(1, n))
        : item.t1 - item.t0;
      return {
        time,
        duration,
        pitch: 100,
        index,
      } as PitchArtNote;
    });
    const endTime = showTimeNormalization && n > 1 ? totalDuration : tEnd - tStart;
    notes.push({ time: endTime, duration: 1, pitch: 1, index: -1 });
    const controller = this;

    // @ts-ignore
    const midiPart = new Tone.Part(function (
      time: Encoding.Time,
      note: PitchArtNote
    ) {
      controller.setState({ activePlayIndex: note.index });
      if (note.index !== -1) {
        synth.triggerAttackRelease(note.pitch, note.duration, time);
      }
      // @ts-ignore
    },
    notes).start();

    Tone.Transport.start();
  }

  playSound(pitch: number) {
    const synth = new Tone.Synth().toMaster();
    synth.triggerAttackRelease(pitch, this.pitchArtSoundLengthSeconds);
  }

  imageBoundaryClicked(coordConverter: PitchArtCoordConverter) {
    const yPos = this.stageRef.current!.getStage().getPointerPosition().y;
    const pitch = coordConverter.rectCoordsToVertValue(yPos);
    this.playSound(pitch);
  }

  setPointerEnabled(isEnabled: boolean) {
    this.stageRef.current!.getStage().container().style.cursor = isEnabled
      ? "pointer"
      : "default";
  }

  maybeUserPitchView(windowConfig: PitchArtWindowConfig) {
    if (
      !this.props.rawPitchValueLists ||
      this.props.rawPitchValueLists.length === 0
    ) {
      return;
    }

    const lastIndex = this.props.rawPitchValueLists.length - 1;

    if (!this.props.showPrevPitchValueLists) {
      return (
        <UserPitchView
          pitchValues={this.props.rawPitchValueLists[lastIndex]}
          windowConfig={windowConfig}
          showTimeNormalized={this.props.showTimeNormalization}
          showVerticallyCentered={this.props.showVerticallyCentered}
          showPerceptualScale={this.props.showPerceptualScale}
        />
      );
    }

    const colors: { [key: number]: string } = {
      0: "#272264",
      1: "#71002b",
      2: "#92278f",
      3: "#5b4a42",
      4: "#f1592a",
      5: "#283890",
      6: "#a01f62"
    };

    return this.props.rawPitchValueLists.map((item: RawPitchValue[], index) => (
      <UserPitchView
        pitchValues={item}
        key={"user-pitch-view-" + index}
        windowConfig={windowConfig}
        showTimeNormalized={this.props.showTimeNormalization}
        showVerticallyCentered={this.props.showVerticallyCentered}
        showPerceptualScale={this.props.showPerceptualScale}
        fillColor={
          index < lastIndex
            ? colors[index % Object.keys(colors).length]
            : undefined
        }
        opacity={index < lastIndex ? 0.35 : undefined}
      />
    ));
  }

  colorScheme = (
    showArtDesign: boolean,
    speaker: Speaker,
    speakerIndex: number
  ): ColorScheme => {

    let lineStrokeColor = "#272264";
    let praatDotFillColor = "#0ba14a";
    lineStrokeColor = speaker.lineColor !== undefined ? speaker.lineColor: PitchArtLegend.SPEAKER_COLOR(speakerIndex);
    praatDotFillColor = speaker.dotColor !== undefined ? speaker.dotColor: PitchArtLegend.SPEAKER_COLOR(speakerIndex);
    

    return {
      windowLineStrokeColor: lineStrokeColor,
      lineStrokeColor,
      praatDotFillColor,
      activePlayColor: "#e8e82e",
      manualDotFillColor: "#af0008",
    };
  };

  maybeShowPitchScale = (windowConfig: PitchArtWindowConfig) => {
    if (!this.props.showPitchScale) {
      return;
    }

    return (
      <PitchArtCoordinateSystem
        fontSize={this.fontSize * 0.75}
        windowConfig={windowConfig}
        xOrigin={windowConfig.x0 * 0.77}
        xMax={windowConfig.x0 + windowConfig.innerWidth + windowConfig.x0 / 2}
        showPerceptualScale={this.props.showPerceptualScale}
        axisTickMarkClicked={this.imageBoundaryClicked}
        setPointerEnabled={this.setPointerEnabled}
      />
    );
  };

  maybeShowMetildaWatermark = (windowConfig: PitchArtWindowConfig) => {
    if (!this.props.showMetildaWatermark) {
      return (
        <PitchArtMetildaWatermark
          type="wm1"
          fontSize={this.fontSize}
          windowConfig={windowConfig}
          xOrigin={windowConfig.x0}
          xMax={windowConfig.x0 + windowConfig.innerWidth}
          showPerceptualScale={this.props.showPerceptualScale}
          showPitchScale={this.props.showPitchScale}
        />
      );
    }

    return (
      <PitchArtMetildaWatermark
        type="wm2"
        fontSize={this.fontSize}
        windowConfig={windowConfig}
        xOrigin={windowConfig.x0}
        xMax={windowConfig.x0 + windowConfig.innerWidth}
        showPerceptualScale={this.props.showPerceptualScale}
        showPitchScale={this.props.showPitchScale}
      />
    );
  };

  addSecondaryAccent = () => {
    const { contextMenuSpeakerIndex, contextMenuLetterIndex } = this.state;

    if (contextMenuSpeakerIndex === null || contextMenuLetterIndex === null) {
      return;
    }

    this.setState((prev) => ({
      secondaryAccentBySpeaker: {
        ...prev.secondaryAccentBySpeaker,
        [contextMenuSpeakerIndex]: contextMenuLetterIndex,
      },
      contextMenuVisible: false,
    }));
  };

  onRemoveSecondaryAccent = () => {
    const { contextMenuSpeakerIndex } = this.state;
    if (contextMenuSpeakerIndex === null) return;
    this.setState((prev) => {
      const next = { ...prev.secondaryAccentBySpeaker };
      delete next[contextMenuSpeakerIndex];
      return { secondaryAccentBySpeaker: next, contextMenuVisible: false };
    });
  };

  isIndexMerged = (letterIndex: number) => {
    return this.state.mergedIndexes[letterIndex] !== undefined;
  };

  mergeCurrentIndex = () => {
    const { contextMenuSpeakerIndex, contextMenuLetterIndex } = this.state;
    if (contextMenuSpeakerIndex === null || contextMenuLetterIndex === null) return;

    // if anchor speaker doesn't have that index, do nothing
    const anchorHasIndex =
      !!this.props.speakers[contextMenuSpeakerIndex]?.letters?.[contextMenuLetterIndex];
    if (!anchorHasIndex) {
      this.setState({ contextMenuVisible: false });
      return;
    }

    this.setState((prev) => ({
      mergedIndexes: {
        ...prev.mergedIndexes,
        [contextMenuLetterIndex]: { anchorSpeakerIndex: contextMenuSpeakerIndex },
      },
      contextMenuVisible: false,
    }));
  };

  unmergeCurrentIndex = () => {
    const { contextMenuLetterIndex } = this.state;
    if (contextMenuLetterIndex === null) return;

    this.setState((prev) => {
      const next = { ...prev.mergedIndexes };
      delete next[contextMenuLetterIndex];
      return { mergedIndexes: next, contextMenuVisible: false };
    });
  };

  hideCurrentSpeaker = () => {
    const { contextMenuSpeakerIndex } = this.state;
    if (contextMenuSpeakerIndex === null) return;
    this.setState((prev) => ({
      hiddenSpeakerIndices: prev.hiddenSpeakerIndices.includes(contextMenuSpeakerIndex)
        ? prev.hiddenSpeakerIndices
        : [...prev.hiddenSpeakerIndices, contextMenuSpeakerIndex],
      contextMenuVisible: false,
    }));
  };

  showAllSpeakers = () => {
    this.setState({ hiddenSpeakerIndices: [], contextMenuVisible: false });
  };

  openContextMenuOnBackground = (e: any) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    const x = e.evt.clientX + window.scrollX;
    const y = e.evt.clientY + window.scrollY;
    this.setState({
      contextMenuVisible: true,
      contextMenuX: x,
      contextMenuY: y,
      contextMenuSpeakerIndex: null,
      contextMenuLetterIndex: null,
    });
  };

  render() {
    const windowConfig = {
      innerHeight: this.innerHeight,
      innerWidth: this.innerWidth,
      y0: this.pointDy0,
      x0: this.pointDx0,
      dMin: this.props.minPitch,
      dMax: this.props.maxPitch,
      tMin: this.props.minTime,
      tMax: this.props.maxTime,
    };

    const colorSchemes = this.props.speakers.map((item, index) =>
      this.colorScheme(this.props.showArtDesign, item, index)
    );
    const coordConverter = new PitchArtCoordConverter(
      windowConfig,
      [],
      false,
      false,
      this.props.showPerceptualScale
    );

    return (
      <div className="PitchArtDrawingWindow">
        {this.saveNewImageModal()}
        <Stage
          className="PitchArtDrawingWindow-pitchart"
          ref={this.stageRef}
          width={this.props.width}
          height={this.props.height}
        >
          <Layer>
            <Rect
              width={this.props.width}
              height={this.props.height}
              fill="white"
              onContextMenu={this.openContextMenuOnBackground}
            />
            <Line
              points={[
                this.innerBorderX0,
                this.innerBorderY0,
                this.props.width - this.innerBorderX0,
                this.innerBorderY0,
                this.props.width - this.innerBorderX0,
                this.props.height - this.innerBorderY0,
                this.innerBorderX0,
                this.props.height - this.innerBorderY0,
                this.innerBorderX0,
                this.innerBorderY0,
              ]}
              strokeWidth={
                this.props.showPitchArtImageColor ? this.borderWidth : 0
              }
              stroke={ colorSchemes[0].windowLineStrokeColor}
              onClick={() => this.imageBoundaryClicked(coordConverter)}
              onContextMenu={this.openContextMenuOnBackground}
              onMouseEnter={() => this.setPointerEnabled(true)}
              onMouseLeave={() => this.setPointerEnabled(false)}
            />
          </Layer>
          {this.maybeShowPitchScale(windowConfig)}
          {this.maybeUserPitchView(windowConfig)}
          {this.maybeShowMetildaWatermark(windowConfig)}
          <PitchArtGeometry
            speakers={this.props.speakers}
            windowConfig={windowConfig}
            setLetterPitch={this.props.setLetterPitch}
            colorSchemes={colorSchemes}
            playSound={this.playSound}
            activePlayIndex={this.state.activePlayIndex}
            activePlaySpeakerIndex={this.state.activePlaySpeakerIndex}
            showDynamicContent={this.props.showDynamicContent}
            showArtDesign={this.props.showArtDesign}
            showPitchArtLines={this.props.showPitchArtLines}
            showLargeCircles={this.props.showLargeCircles}
            showVerticallyCentered={this.props.showVerticallyCentered}
            showAccentPitch={this.props.showAccentPitch}
            showSyllableText={this.props.showSyllableText}
            showTimeNormalization={this.props.showTimeNormalization}
            showPerceptualScale={this.props.showPerceptualScale}
            showPrevPitchValueLists={this.props.showPrevPitchValueLists}
            largeCircleRadius={this.largeCircleRadius}
            smallCircleRadius={this.smallCircleRadius}
            averageCircleRadius={this.resolveDotRadius(this.props.averageDotSize, "L")}
            contourCircleRadius={this.resolveDotRadius(this.props.contourDotSize, "S")}
            graphWidth={this.graphWidth}
            fontSize={this.fontSize}
            circleStrokeWidth={this.circleStrokeWidth}
            pitchArtSoundLengthSeconds={this.pitchArtSoundLengthSeconds}
            accentedCircleRadius={this.accentedCircleRadius}
            setPointerEnabled={this.setPointerEnabled}
            isLearn={this.props.isLearn}
            onOpenContextMenu={(x, y, speakerIndex, letterIndex) =>
              this.setState({
                contextMenuVisible: true,
                contextMenuX: x,
                contextMenuY: y,
                contextMenuSpeakerIndex: speakerIndex,
                contextMenuLetterIndex: letterIndex,
              })
            }
            secondaryAccentBySpeaker={this.state.secondaryAccentBySpeaker}
            mergedIndexes={this.state.mergedIndexes}
            hiddenSpeakerIndices={this.state.hiddenSpeakerIndices}
          />
        </Stage>

        {this.state.contextMenuVisible &&
          (this.state.contextMenuSpeakerIndex !== null || this.state.hiddenSpeakerIndices.length > 0) && (
          <PitchArtContextMenu
              x={this.state.contextMenuX}
              y={this.state.contextMenuY}
              onAddSecondaryAccent={this.addSecondaryAccent}
              onRemoveSecondaryAccent={this.onRemoveSecondaryAccent}
              onClose={() => this.setState({ contextMenuVisible: false })}
              isMerged={this.isIndexMerged(this.state.contextMenuLetterIndex)}
              onMergeIndex={this.mergeCurrentIndex}
              onUnmergeIndex={this.unmergeCurrentIndex}
              onHideThisSpeaker={this.hideCurrentSpeaker}
              onShowAllSpeakers={this.showAllSpeakers}
              contextMenuSpeakerIndex={this.state.contextMenuSpeakerIndex}
              contextMenuLetterIndex={this.state.contextMenuLetterIndex}
              hiddenSpeakerIndices={this.state.hiddenSpeakerIndices}
              hasSecondaryAccentOnThisCircle={
                this.state.contextMenuSpeakerIndex !== null &&
                this.state.contextMenuLetterIndex !== null &&
                this.state.secondaryAccentBySpeaker[this.state.contextMenuSpeakerIndex] === this.state.contextMenuLetterIndex
              }
            />
          )}
        <a className="hide" ref={this.downloadRef}>
          Hidden Download Link
        </a>
      </div>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, AudioAction>
) => ({
  setLatestAnalysisId: (
    speakerIndex: number,
    latestAnalysisId: number,
    latestAnalysisName: string,
    lastUploadedLetters: Letter[]
  ) =>
    dispatch(
      setLatestAnalysisId(
        speakerIndex,
        latestAnalysisId,
        latestAnalysisName,
        lastUploadedLetters
      )
    ),
});
export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
  PitchArtDrawingWindow
);
