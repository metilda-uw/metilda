import axios, {AxiosResponse} from "axios";
const baseUrl: string = "/api/words";

const getInitializer: RequestInit = {
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
};

const getWordsBySyllableCount = async (numSyllables?: number, accentIndex?: number) => {
    let getUrl: string = baseUrl;

    if (typeof numSyllables !== "undefined") {
        getUrl += "?numSyllables=" + numSyllables;
    }

    if (typeof accentIndex !== "undefined") {
        getUrl += "&accentIndex=" + accentIndex;
    }

    const response: AxiosResponse<any> = await axios.get(getUrl);

    return response.data;
};

export default { getWordsBySyllableCount };

const getWordById = async (id) => {
    let getUrl: string = baseUrl+"/byId?pitchart=" + id;

    const response: AxiosResponse<any> = await axios.get(getUrl);

    return response.data;
};

export { getWordById };
