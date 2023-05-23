
export const ConverterHelper = {

      ConversionFormulas : {
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
    },

    findExactFrequency: (data, freq)=>{
        let left = 0;
        let right = data.length - 1;
       
        while (left <= right) {
          let mid = Math.floor((left + right) / 2);
          if (data[mid].frequency === parseFloat(freq)) {
            return mid;
          } else if (data[mid].frequency < freq) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
        return null; // Frequency not found
    },
    findNearestFrequency: (data, freq) => {
        let low = 0;
        let high = data.length - 1;
        let mid;
      
        while (low <= high) {
          mid = Math.floor((low + high) / 2);
      
          if (data[mid].frequency === freq) {
            const meTValue = ConverterHelper.ConversionFormulas["Hz"]["MeT"](freq).toFixed(2);
            return {"frequency":data[mid].frequency,"MeTValue":meTValue.toFixed(2),"note": data[mid].note};
          } else if (data[mid].frequency < freq) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
      
        // At this point, low > high, so we need to check which
        // frequency value is closer to the target frequency
        console.log("low : " + low);
        console.log("high : " + high);
        let nearestFreq;
        let nearestFreqIndex;
        if((high < 0 || high >= data.length) && (low >= 0 || low < data.length)){
            nearestFreq = data[low].frequency;
            nearestFreqIndex = low;
        }else if((high >= 0 || high < data.length) && (low < 0 || low >= data.length)){
            nearestFreq = data[high].frequency;
            nearestFreqIndex = high;
        }else if (Math.abs(data[low].frequency - freq) < Math.abs(data[high].frequency - freq)) {
            nearestFreq = data[low].frequency;
            nearestFreqIndex = low;
        } else {
            nearestFreq = data[high].frequency;
            nearestFreqIndex = high;
        }

        console.log("nearestFreqIndex " + nearestFreqIndex);
        console.log("user entered frequency " + freq);
        let lowerFrequencyIndex = -1;
        let upperFrequencyIndex = -1;
        if(nearestFreqIndex - 1 >= 0  && data[nearestFreqIndex-1].frequency <= freq && freq <= data[nearestFreqIndex].frequency){
            lowerFrequencyIndex = nearestFreqIndex - 1;
            upperFrequencyIndex = nearestFreqIndex;
        }

        if(nearestFreqIndex + 1 < data.length && data[nearestFreqIndex].frequency <= freq && freq <= data[nearestFreqIndex+1].frequency){
            lowerFrequencyIndex = nearestFreqIndex;
            upperFrequencyIndex = nearestFreqIndex+1;
        }

        console.log("lowerFrequencyIndex " + lowerFrequencyIndex);
        console.log("upperFrequencyIndex " + upperFrequencyIndex);


        // remove the code after wards
        if(lowerFrequencyIndex == -1 || upperFrequencyIndex == -1)
          return {"frequency":1,"MeTValue":1,"noteName": "No Note found"};

        let lowerMeTScaleValue = 48 * Math.log2(data[lowerFrequencyIndex].frequency/440);
        let upperMeTScaleValue = 48 * Math.log2(data[upperFrequencyIndex].frequency/440);

        const freqMeTValuesArray = ConverterHelper.divideIntoEightEqualParts(data[lowerFrequencyIndex].frequency,lowerMeTScaleValue,
            data[upperFrequencyIndex].frequency,upperMeTScaleValue);
        
        // check nearest freq value from freMeT Values array and return frequency and MeTVale
        // TO DO

        let closestFreq = freqMeTValuesArray[0].frequency;
        let closestMeT = freqMeTValuesArray[0].MeTValue;
        let index = 0;
        for (let i = 1; i < freqMeTValuesArray.length; i++) {
            if (Math.abs(freqMeTValuesArray[i].frequency - freq) < Math.abs(closestFreq - freq)) {
                closestFreq = freqMeTValuesArray[i].frequency;
                closestMeT = freqMeTValuesArray[i].MeTValue;
                index = i;
            }
        }
        console.log("closestFreq " + closestFreq);
        console.log("closestMeT " + closestMeT);
        let note= "";
        if(index == 0){
          note = data[lowerFrequencyIndex].note;
        }else {
          note = data[lowerFrequencyIndex].note +" "+ index + "/8";
        }
        // console.log("Note Name " + data[lowerFrequencyIndex].note +" "+ index + "/8");
        return {"frequency":closestFreq.toFixed(2),"MeTValue":closestMeT.toFixed(2),"note": note};

      },

      divideIntoEightEqualParts: (lowerFreq,lowerMeT,upperFreq,upperMeT)=>{
        // 8 intervals
        let interval = Math.abs(upperMeT - lowerMeT)/8
        let arr =[];
        arr.push({"frequency":lowerFreq,"MeTValue":lowerMeT});

        let isNegative = lowerFreq < 0 ? true: false;
        console.log("frequency values: ");
        for(let i=1;i<=7;i++){
            let meTValue;
            if(isNegative){
                meTValue = (lowerMeT * -1) - (i * interval);
                meTValue = meTValue *-1;
            }else{
                meTValue = lowerMeT + (i * interval);
            }
            const freq = 440 * Math.pow(Math.pow(2,1/48),meTValue)

            console.log("freq : " +freq + " Met :" + meTValue);
            arr.push({"frequency":freq,"MeTValue":meTValue});
        }

        arr.push({"frequency":upperFreq,"MeTValue":upperMeT});
        return arr;
      }
     

}