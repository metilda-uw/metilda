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
}
