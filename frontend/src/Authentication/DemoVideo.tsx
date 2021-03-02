import React from "react";
import "./DemoVideo.scss";

export const DemoVideo: React.FC<{}> = () => {
    return (
        <div className="demo-container">
            <iframe
                className="demo-vid"
                title="MeTILDA Demo Video"
                src="https://www.youtube.com/embed/ZvnhpMH6VOw"
                frameBorder="0"
                allow="accelerometer;
                        autoplay;
                        clipboard-write;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture"
        allowFullScreen
      />
    </div>
    );
};
