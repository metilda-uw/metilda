import React from 'react';

interface ColorPickerProps {
    setColor: (color:string) => void;
}

class ColorPicker extends React.Component<ColorPickerProps> {

    state = {
        color: "#FFFF00"
    }

    componentDidMount() {
        this.props.setColor(this.state.color); 
      }
     
    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = event.target.value;
        this.setState({ color: newColor });
        this.props.setColor(newColor);
      };
      

    render() {
        return (
            <div >
                <input type="color" value={this.state.color} onChange={this.handleChange} />
            </div>
        );
    }
}

export default ColorPicker;
