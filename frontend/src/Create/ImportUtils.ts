import {Result} from "react-file-reader-input";
import {Speaker} from "../types/types";

export function importSpeakerFile(
    results: Result[],
    speakerIndex: number,
    setSpeakerFunc: (speakerIndex: number, speaker: Speaker) => void) {
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
