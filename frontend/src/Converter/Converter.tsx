import React from "react";
import Header from "../Components/header/Header";

class Converter extends React.Component{
    render() {
        return (
            <div>
                <Header></Header>
                {/* <form className="form-converter"> */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ marginRight: "10px"}}>Hz:</p>
                    <input style={{ marginRight: "10px", width: "50%"}} className="form-converter-scale-Hz" name="scale-Hz" type="text" placeholder="Enter value" />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{marginRight: "10px"}}>MeT:</p>
                    <input style={{marginRight: "10px", width: "50%"}} className="form-collections-scale-MeT" name="scale-MeT" type="text" placeholder="Enter value"/>
                </div>

                    
                {/* </form> */}
            </div>    
        );
    }
}
export default Converter;