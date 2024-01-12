

export const getPitchArtDesigns = async(firebase) =>{

    const result = await firebase.storage.ref().child("PitchArtDesigns").listAll();

    // Array of file references
    const files = result.items; 

    
    // Accessing metadata and other properties

    let designDetails = [];
    const promises = files.map(async (fileRef) => {
        const downloadURL = await fileRef.getDownloadURL();
        const metadata = await fileRef.getMetadata();
        return { url: downloadURL, imageName: metadata.name };
    });

    designDetails = await Promise.all(promises);

    const pitchArtDesigns = [];

    const pitchArt1 = {
            lineColor: "#272264",
            dotColor:"#0ba14a",
            imageId: designDetails[0].imageName,
            imageUrl:designDetails[0].url
    }
    pitchArtDesigns.push(pitchArt1);

    const pitchArt2 = {
        lineColor: "#71002b",
        dotColor:"#2e3192",
        imageId: designDetails[1].imageName,
        imageUrl:designDetails[1].url
    }
    pitchArtDesigns.push(pitchArt2);

    const pitchArt3 = {
        lineColor: "#92278f",
        dotColor:"#000000",
        imageId: designDetails[2].imageName,
        imageUrl:designDetails[2].url
    }
    pitchArtDesigns.push(pitchArt3);

    const pitchArt4 = {
        lineColor: "#056839",
        dotColor:"#be72b0",
        imageId: designDetails[3].imageName,
        imageUrl:designDetails[3].url
    }
    pitchArtDesigns.push(pitchArt4);
    const pitchArt5 = {
        lineColor: "#5b4a42",
        dotColor:"#166e92",
        imageId: designDetails[4].imageName,
        imageUrl:designDetails[4].url
    }
    pitchArtDesigns.push(pitchArt5);

    const pitchArt6 = {
        lineColor: "#f1592a",
        dotColor:"#12a89d",
        imageId: designDetails[5].imageName,
        imageUrl:designDetails[5].url
    }
    pitchArtDesigns.push(pitchArt6);
    const pitchArt7 = {
        lineColor: "#283890",
        dotColor:"#8cc63e",
        imageId: designDetails[6].imageName,
        imageUrl:designDetails[6].url
    }
    pitchArtDesigns.push(pitchArt7);

    const pitchArt8 = {
        lineColor: "#a01f62",
        dotColor:"#f7941d",
        imageId: designDetails[7].imageName,
        imageUrl:designDetails[7].url
    }
    pitchArtDesigns.push(pitchArt8);

    return pitchArtDesigns;

}

export const getLineColors = () =>{
    const LineColors = ["#272264","#71002b","#92278f","#056839","#5b4a42","#f1592a","#283890","#a01f62"];

    const colorNames = {
    "#272264": "Dark Blue",
    "#71002b": "Dark Red",
    "#92278f": "Purple",
    "#056839": "Dark Green",
    "#5b4a42": "Brown",
    "#f1592a": "Orange",
    "#283890": "Indigo",
    "#a01f62": "Pink",
    };

    const colorMap = new Map();
    for (const colorCode in colorNames) {
    colorMap.set(colorCode, colorNames[colorCode]);
    }
    return colorMap;

}

export const getDotColors = () =>{
    const dotColors = ["#0ba14a","#2e3192","#000000","#be72b0","#166e92","#12a89d","#8cc63e","#f7941d"];
    const colorMap = new Map([
        ["#0ba14a", "Dark Green"],
        ["#2e3192", "Dark Blue"],
        ["#000000", "Black"],
        ["#be72b0", "pink"],
        ["#166e92", "Blue"],
        ["#12a89d", "Teal"],
        ["#8cc63e", "Yellow Green"],
        ["#f7941d", "Orange"],
      ]);

    return colorMap;
}