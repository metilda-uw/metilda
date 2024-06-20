import React, {useEffect, useState } from "react";
import Header from "../Components/header/Header";
import './Converter.scss';
import { frequencyData } from './FrequencyData'
import { ConverterHelper } from './ConverterHelper';
import { callbackify } from "util";

function Converter(){
    const MIN_FREQUENCY = 16.35;
    const MAX_FREQUENCY = 7902.13;
    const MET_SCALE_TEXT = "steps from A4, A2";
    const [fromScaleName, setFromScaleName] = useState('Hz');
    const [toScaleName, setToScaleName] = useState('MeT');
    const [fromScaleValue, setFromScaleValue] = useState(110);
    const [toScaleValue, setToScaleValue] = useState(-96);
    const [fromTimer, setFromTimer] = useState(null);
    const [toTimer, setToTimer] = useState(null);
    const [meTtext, setMetScaleText] = useState("Steps from A4 , A2");
    const [noteText, setNoteText] = useState('');

    const scaleOptions = ['Hz', 'Semitones', 'Mel', 'MeT'];

    /**
     * Method to handle user input
     * It waits till the user complete's entering input
     * @param e input event
     */
    const onFromScaleValueChange = (e) => {
        const eventData = e;
        setFromScaleValue(e.target.value);

        clearTimeout(fromTimer);
        e.persist();
        function callback(event){
            handleFromScaleValueChange(event);
        }

        const newTimer = setTimeout(callback, 1500, e);

        setFromTimer(newTimer);
    }

    const onToScaleValueChange = (e) => {
        setToScaleValue(e.target.value)

        clearTimeout(toTimer)
        e.persist();
        const newTimer = setTimeout((event) => {
            handleToScaleValueChange(event);
        }, 1500,e)

        setToTimer(newTimer);
    }

    /** This function is called when FROM scale name changes
     */
    const handleFromScaleNameChange = (e) => {
        setFromScaleName(e.target.value);
        const convertedValue = convertScales(toScaleValue,toScaleName,e.target.value); // Automatically convert "From" amount
        setFromScaleValue(convertedValue);
    };

    /** This function is called when TO scale name changes
     */
    const handleToScaleNameChange = (e) => {
        setToScaleName(e.target.value);
        const convertedValue = convertScales(fromScaleValue,fromScaleName,e.target.value); // Automatically convert "To" amount
        setToScaleValue(convertedValue);

    };

    /** This function is called when FROM scale VALUE changes
     */
    const handleFromScaleValueChange = (e) => {
        console.log("In handleFromScaleValueChange");
        if(fromScaleName == 'Hz' && toScaleName == 'MeT'){
            if(e.target.value < MIN_FREQUENCY){
                const newValue = window.confirm(`The value must greater than or equal to ${MIN_FREQUENCY} HZ.`);//Added prompt window for wrong input min value HZ
                e.target.value = MIN_FREQUENCY;
            }
            if(e.target.value > MAX_FREQUENCY){
                const newValue = window.confirm(`Value must less than or equal to ${MAX_FREQUENCY} HZ.`);//Added prompt window for wrong input max value HZ
                e.target.value = MAX_FREQUENCY;
            }
        }
        setFromScaleValue(e.target.value);
        const convertedValue = convertScales(e.target.value, fromScaleName, toScaleName); // Automatically convert "From" amount
        setToScaleValue(convertedValue);
    };

    /** This function is called when TO scale VALUE changes
     */
    const handleToScaleValueChange = (e) => {
        if(toScaleName == 'Hz' && fromScaleName == 'MeT'){
            if(e.target.value < MIN_FREQUENCY){
                const newValue = window.confirm(`Value must greater than or equal to ${MIN_FREQUENCY} HZ.`);//Added window prompt for wrong input min value HZ
                e.target.value = MIN_FREQUENCY;
            }
            if(e.target.value > MAX_FREQUENCY){
                const newValue = window.confirm(`Value must less than or equal to ${MAX_FREQUENCY} HZ.`);//Added window prompt for wrong input max value HZ
                e.target.value = MAX_FREQUENCY;
            }
        }
        setToScaleValue(e.target.value);
        const convertedValue = convertScales(e.target.value, toScaleName, fromScaleName); // Automatically convert "To" amount
        setFromScaleValue(convertedValue);
    };

    /** This function converts value from one scale to  another scale
     * @param value : value of from scale
     * @param fromScaleName : from scale name
     * @param ToScaleName : to scale name
     * returns a value
     */
    const convertScales = (value, fromScaleName, toScaleName) => {

        if (fromScaleName === toScaleName) {
            return value;
        }
        setNoteText('');
        setMetScaleText('');

        if(fromScaleName == "Hz" && toScaleName == "MeT"){ // Hz to MeT Conversion
            return updateMeTValueAndText(value, fromScaleName, toScaleName);
        }else if(fromScaleName == "MeT" && toScaleName == "Hz"){ // MeT to Hz Conversion
            return updateHzValue(value, fromScaleName, toScaleName);
        }else { // To handle remaining conversions
            return ConverterHelper.ConversionFormulas[fromScaleName][toScaleName](value).toFixed(2);
        }
    };

    /**
     * Function convert HZ to MeT value
     * @param frequency
     * @param fromScaleName
     * @param toScaleName
     * @returns
     */
    const updateMeTValueAndText= (frequency, fromScaleName, toScaleName) => {

        // check if exact freqency value exists in frequency data
        let freqIndex = ConverterHelper.findExactFrequency(frequencyData,frequency);
        let noteName = null;
        if(freqIndex != null){
            noteName = frequencyData[freqIndex].note;
            setMetScaleText("Steps from A4 , " + noteName);
            return ConverterHelper.ConversionFormulas[fromScaleName][toScaleName](frequency).toFixed(2);
        }

        // if exact frequency is not found, display a text to user saying about the same.

        let freqDataObject = ConverterHelper.findNearestFrequency(frequencyData,frequency);
        setMetScaleText("Steps from A4, " + freqDataObject.note);
        setNoteText("Note: The MeT value is based on nearest valid frequency i.e " + freqDataObject.frequency);

        console.log(noteText);
        return freqDataObject.MeTValue;
    };

    /**
     * Function to convert MeT Value to Hz value
     * @param metValue
     * @param fromScaleName
     * @param toScaleName
     */
    const updateHzValue = (metValue, fromScaleName, toScaleName) => {

        // convert met value to frequency in Hz
        const frequency = ConverterHelper.ConversionFormulas[fromScaleName][toScaleName](metValue).toFixed(2);

        /**
         *  check if exact frequency value exists in frequency data because , if frequency
         * is found it means that there exist a valid MeT value.
         * */
        let freqIndex = ConverterHelper.findExactFrequency(frequencyData,frequency);

        console.log("frequencyIndex  :::" + freqIndex);
        if(freqIndex != null){
            setMetScaleText("Steps from A4, " + frequencyData[freqIndex].note);
            return frequency;
        }

        /**
         * handle case if exact frequency is not found, then we need to find nearest valid
         * met value to find valid frequency in Hz
         * */

        let freqDataObject = ConverterHelper.findNearestFrequency(frequencyData,frequency);
        /**
         * A text info for the user that meTScale note name is
         * based on the nearest valid met value.
         */
        setMetScaleText("Steps from A4, " + freqDataObject.note);

        /**
         * A text info for the user that's the frequency which is returned is
         * based on nearest valid met value for the user entered met value.
         * */
        setNoteText("Note: The Hz value is based on nearest valid step of MeT Scale i.e " + freqDataObject.MeTValue);
        return freqDataObject.frequency;

    };

    /**
     * A unit switcher for each scale name
     * switch unit name with scaleName
     * @param scaleName
     **/
    const getUnit = (scaleName) => {
        switch (scaleName) {
            case "Hz":
                return "hz";
            case "Semitones":
                return "semitones";
            case "Mel":
                return "mel";
            case "MeT":
                return "MeT";
            default:
                return "";
        }
    }

    return (
        <div className="metilda-conversions">
            <Header></Header>
            <h3>Converter</h3>
            <div className="scale-conversion">
                <div className="from-scale" >
                    <label className="from-label">From Scale:</label>
                    <div className="from-scale-details">
                        <select className="from-scale-name" value={fromScaleName} onChange={handleFromScaleNameChange}>
                            {scaleOptions.map((scale) => (
                                <option key={scale} value={scale}>
                                    {scale}
                                </option>
                            ))}
                        </select>
                        {(toScaleName == "MeT") && (fromScaleName == "Hz") && (
                            <div>
                                <input type="number" min="16.35" max="7902.13" step="0.1"
                                       className="from-scale-value"
                                       value={fromScaleValue}
                                       onChange={onFromScaleValueChange}
                                />
                                <span className="from-scale-unit">{getUnit(fromScaleName)}</span>
                            </div>
                        )}
                        {!((toScaleName == "MeT") && (fromScaleName == "Hz")) && (
                            <div>
                                <input
                                    type="number"
                                    className="from-scale-value"
                                    value={fromScaleValue}
                                    onChange={onFromScaleValueChange}
                                />
                                <span className="from-scale-unit">{getUnit(fromScaleName)}</span>
                            </div>
                        )
                        }
                    </div>
                    <div>
                        {(fromScaleName == "MeT" && toScaleName == "Hz") && <p className="p">{meTtext}</p>}
                    </div>
                </div>
                <div className="to-scale" >
                    <label className="to-label">To Scale:</label>
                    <div className="to-scale-details">
                        <select className="to-scale-name" value={toScaleName} onChange={handleToScaleNameChange}>
                            {scaleOptions.map((scale) => (
                                <option key={scale} value={scale}>
                                    {scale}
                                </option>
                            ))}
                        </select>

                        {(fromScaleName == "MeT") && (toScaleName == "Hz") && (
                            <div>
                                <input type="number" min="16.35" max="7902.13" step="0.1"
                                       className="to-scale-value"
                                       value={toScaleValue}
                                       onChange={onToScaleValueChange}
                                />
                                <span className="to-scale-unit">{getUnit(toScaleName)}</span>
                            </div>
                        )
                        }
                        {!((fromScaleName == "MeT") && (toScaleName == "Hz")) && (
                            <div>
                                <input
                                    type="number"
                                    className="to-scale-value"
                                    value={toScaleValue}
                                    onChange={onToScaleValueChange}
                                />
                                <span className="to-scale-unit">{getUnit(toScaleName)}</span>
                            </div>
                        )
                        }
                    </div>
                    <div>
                        {(toScaleName == "MeT" && fromScaleName == "Hz") && <p className="p">{meTtext}</p>}
                    </div>
                </div>
            </div>
            <div className="user-note">
                {(noteText != '') &&  <p className="note-text">{noteText}</p>}
            </div>
            <div>
                <body>
                <b className="b">Tooltips</b>
                <p className="tips-p">Hz: Hz is the unit of frequency measurement and represents cycles per second.
                    It is commonly used to measure the frequency of sound waves and vibrations.
                    In music, Hz is used to represent the pitch of a note, where higher Hz values correspond to
                    higher-pitched notes and lower Hz values correspond to lower-pitched notes.
                </p>
                <p className="tips-p">Semitones: A semitone, also called a half step or a half tone,
                    is the smallest musical interval commonly used in Western tonal music,
                    and it is considered the most dissonant when sounded harmonically.
                    It is defined as the interval between two adjacent notes in a 12-tone scale.
                </p>
                <p className="tips-p">Mel: The mel scale (after the word melody) is a perceptual scale of pitches
                    judged by listeners to be equal in distance from one another.
                </p>
                <p className="tips-p">MeT: The MeT scale is a perceptual scale developed by adopting and extending the equal temperament scale in western music. 
                The MeT scale enables the visualization of pitch data by aligning pitch data (in Hz) to a repeating series of 12 notes that form an octave.
                 This allows users to focus on the melody or contour of the word, while disregarding the speakers’ actual pitch ranges, 
                 which can vary due to age, gender, or other physical factors.</p>
                </body>
            </div>
        </div>
    );

}
export default Converter;
