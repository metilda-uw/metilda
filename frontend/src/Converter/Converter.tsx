import React, {useState } from "react";
import Header from "../Components/header/Header";

function Converter(){
    const [hzValue, setHzValue] = useState(0);
    const [MeTValue, setMeTValue] = useState(0);

    const changeHzValue = (event : any) => {
        setHzValue(event.target.value);
        const constant = Math.pow(2,(1/48))
        const MetVal = 440 * Math.pow(constant,event.target.value)
        setMeTValue(MetVal);
    };
    const changeMeTValue = (event : any) => {
        setMeTValue(event.target.value);
        const HzVal = 48 * Math.log2((event.target.value/440));
        setHzValue(HzVal);     
    };

    return (
        <div>
            <Header></Header>
            {/* <div style={{ display: "grid", gridTemplateAreas:"auto"}}></div> */}
            <div style={{ display: "flex", alignItems: "center",flexDirection:"row"}}>
                <p style={{ marginRight: "10px"}}>Hz:</p>
                <input style={{ marginRight: "10px", width: "50%"}} 
                    className="converter-scale-Hz" 
                    name="scale-Hz" 
                    type="number" 
                    value={hzValue}
                    onChange={changeHzValue}
                    placeholder="Enter value"
                />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <p style={{marginRight: "10px"}}>MeT:</p>
                <input style={{marginRight: "10px", width: "50%"}} className="converter-scale-MeT" 
                    name="scale-MeT" 
                    type="number" 
                    value={MeTValue}
                    onChange={changeMeTValue}
                    placeholder="Enter value"
                />
            </div>
        </div>    
    );

}
export default Converter;