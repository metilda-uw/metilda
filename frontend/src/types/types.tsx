export interface Letter {
  t0: number;
  t1: number;
  pitch: number;
  syllable: string;
  isManualPitch: boolean;
  isWordSep: boolean;
  isContour?:boolean;
  contourGroupRange?:number[];
}

export interface FileEntry {
  index: number;
  name: string;
  path: string;
  size: number;
  type: "Upload" | "Folder";
  created: string;
  updated: string;
  user: string;
}

export interface Speaker {
  uploadId: string;
  speakerName?: string;
  word?: string;
  wordTranslation?;
  wordTime?;
  letters: Letter[];
  fileIndex?: number;
  latestAnalysisId?: number;
  lastUploadedLetters?: Letter[];
  latestAnalysisName?: string;
  lineColor?:string;
  dotColor?:string;
}
