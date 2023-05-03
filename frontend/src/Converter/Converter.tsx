import React, {useEffect, useState } from "react";
import Header from "../Components/header/Header";
import './Converter.scss';

function Converter(){
    const [fromScaleName, setFromScaleName] = useState('Hz');
    const [toScaleName, setToScaleName] = useState('MeT');
    const [fromScaleValue, setFromScaleValue] = useState(0);
    const [toScaleValue, setToScaleValue] = useState(0);

    const scaleOptions = ['Hz', 'Semitones', 'Mel', 'MeT']; 
    
    useEffect(() => {
      // initialization of default values up on component mount
      setFromScaleValue(110);
      const tovalue = convertScales(110,'Hz','MeT');
      setToScaleValue(tovalue);
    }, []); 
   
    /** This function is called when FROM scale changes
     */
    const handleFromScaleChange = (e) => {
        setFromScaleName(e.target.value);
        const convertedValue = convertScales(toScaleValue,toScaleName,e.target.value); // Automatically convert "From" amount
        setFromScaleValue(convertedValue);
    };

    /** This function is called when TO scale changes
     */
    const handleToScaleChange = (e) => {
        setToScaleName(e.target.value);
        const convertedValue = convertScales(fromScaleValue,fromScaleName,e.target.value); // Automatically convert "To" amount
        setToScaleValue(convertedValue);

    };
    
    /** This function is called when FROM scale VALUE changes
     */
    const handleFromScaleValueChange = (e) => {
        setFromScaleValue(e.target.value);
        const convertedValue = convertScales(e.target.value, fromScaleName, toScaleName); // Automatically convert "From" amount
        setToScaleValue(convertedValue);
    };

    /** This function is called when TO scale VALUE changes
     */
    const handleToScaleValueChange = (e) => {
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
        console.log("Fromvalue " + value);
        console.log("toScaleName " + toScaleName);
        console.log("fromScaleName " + fromScaleName);
        
        return ConversionFormulas[fromScaleName][toScaleName](value).toFixed(2);
    };

    /** These are formulas for different scale conversions */
    const ConversionFormulas = {
        Hz: {
          Semitones: (value) => 12 * Math.log2(value/440),
          Mel: (value) => 1127.01048 * Math.log10(value/700 +1),
          MeT: (value) => {
            console.log("In HZ scale");
            return 48 * Math.log2(value/440);
          }
        },
        Semitones: {
          Hz: (value) => 440 * Math.pow(2,value/12),
          Mel: (value) => {
            const hzValue = 440 * Math.pow(2,value/12);
            return 1127.01048 * Math.log10(hzValue/700 +1);
            },
          MeT: (value) => {
            const hzValue = 440 * Math.pow(2,value/12);
            return 48 * Math.log2(hzValue/440);
          }
        },
        Mel: {
          Hz: (value) => 700 * (Math.pow(10,value/1127.01048) - 1),
          Semitones: (value) => {
            const hzValue = 700 * (Math.pow(10,value/1127.01048) - 1);
            return 12 * Math.log2(hzValue/440);
          },
          MeT: (value) => {
            const hzValue = 700 * (Math.pow(10,value/1127.01048) - 1);
            return 48 * Math.log2(hzValue/440);
          }
        },
        MeT: {
          Hz: (value) => {
            console.log("In MeT Scale");
            return 440 * Math.pow(Math.pow(2,1/48),value);},
          Semitones: (value) => {
            const hzValue = 440 * Math.pow(Math.pow(2,1/48),value);
            return 12 * Math.log2(hzValue/440);
          },
          Mel: (value) => {
            const hzValue = 440 * Math.pow(Math.pow(2,1/48),value);
            return 1127.01048 * Math.log10(hzValue/700 +1);
          }
        }
    }; 
    //scale-converion style={{display: "flex", width: '75%',flexDirection:"column"}}
    // from-scale style={{flex: "1",display: "flex", flexDirection: "row", marginRight: "10px"}}
    // from-scale-details style = {{display:"flex", width:'75%', flexDirection: "row"}}
    // from-scale-Name style={{display:"block", width:'50%', flex: "1"}}

    return (
        <div className="metilda-conversions">
            <Header></Header>
            <div className="scale-conversion">
                <div className="from-scale" >
                    <div className="from-scale-details">
                      <select className="from-scale-name" value={fromScaleName} onChange={handleFromScaleChange}>
                          {scaleOptions.map((scale) => (
                              <option key={scale} value={scale}>
                                  {scale}
                              </option>
                          ))}
                      </select>
                      <input
                          type="number"
                          className="from-scale-value"
                          value={fromScaleValue}
                          onChange={handleFromScaleValueChange}
                      />
                    </div>
                    <div>
                      {(fromScaleName == "MeT") && <p> steps from A4 and A2</p>}
                    </div>     
                </div>
                <div className="to-scale" >
                    <div className="to-scale-details">
                      <select className="to-scale-name" value={toScaleName} onChange={handleToScaleChange}>
                          {scaleOptions.map((scale) => (
                              <option key={scale} value={scale}>
                                  {scale}
                              </option>
                          ))}
                      </select>
                      <input
                          type="number"
                          className="to-scale-value"
                          value={toScaleValue}
                          onChange={handleToScaleValueChange}
                      />
                    </div>  
                    <div>
                      {(toScaleName == "MeT") && <p> steps from A4 and A2</p>}
                    </div> 
                </div>
            </div>
        </div>    
    );

}
export default Converter;