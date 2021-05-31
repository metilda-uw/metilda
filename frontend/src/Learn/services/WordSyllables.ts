import axios from "axios";
const baseUrl: string = "/api/words";

const getInitializer: RequestInit = {
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
};

const getWordsBySyllableCount = async (numSyllables?: number) => {
    let getUrl: string = baseUrl;

    if (typeof numSyllables !== "undefined") {
        getUrl += "?numSyllables=" + numSyllables;
    }

    const response = await axios.get(getUrl);

    return response.data;
};

export default { getWordsBySyllableCount };
