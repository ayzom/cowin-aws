const axios = require('axios')
var AWS = require("aws-sdk");
AWS.config.update({region: 'ap-south-1'});
AWS.config.loadFromPath("./config.json");

var sns = new AWS.SNS({ apiVersion: "2010-03-31", region: 'ap-south-1' });

function SNSsend(message) {
  // Create publish parameters
  const params = {
    "Message": JSON.stringify(message) /* required */,
    "TopicArn": "arn:aws:sns:ap-south-1:285535506992:aws-cowin-mumbai"
  };

  // Create promise and SNS service object
  const publishTextPromise = sns
    .publish(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  return publishTextPromise
    .then(function (data) {
      console.log(
        `Message ${params.Message} sent to the topic ${params.TopicArn}`
      );
      console.log("MessageID is " + data.MessageId);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
}


const districtId = '395'; // Replace value here
const yourAge = 27  //Replace age with your age.
const appointmentsListLimit = 2 //Increase/Decrease it based on the amount of information you want in the notification.


const intervalInMs = 900000; // 15 mins interval

let message = `No Vaccine slots are now available in last 1hr.`;
//SNSsend(message);

function getDate() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dd = tomorrow.getDate();
    const mm = tomorrow.getMonth() + 1;
    const yyyy = tomorrow.getFullYear();
    return `${dd < 10 ? '0' + dd : dd}-${mm < 10 ? '0' + mm : mm}-${yyyy}`
}
const date = getDate();

function pingCowin(pingCount) {
    console.log("Calling");
    var config = {
        method: 'get',
        url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`,
        headers: { 
          'authority': 'cdn-api.co-vin.in', 
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36', 
          'origin': 'https://www.cowin.gov.in'
        }
      };
      
      axios(config).then((result) => {
        const { centers }= result.data;
        let isSlotAvailable = false;
        let dataOfSlot = "";
        let appointmentsAvailableCount = 0;
        if(centers.length) {
            centers.forEach(center => {
                center.sessions.forEach((session => {
                    if(session.min_age_limit < yourAge && session.available_capacity > 0) {
                        isSlotAvailable = true
                        appointmentsAvailableCount++;
                        if(appointmentsAvailableCount <= appointmentsListLimit) {
                            dataOfSlot = `${dataOfSlot}\nSlot for ${session.available_capacity} is available: ${center.name} on ${session.date}`;
                        }
                    }
                }))
            });
        }
        if(isSlotAvailable) {
            message = `Vaccine slots are now available ${dataOfSlot}`;
            SNSsend(message);
            console.log('Sent Notification to Phone \nStopping Pinger...')
            clearInterval(timer);
        } else if(pingCount%8==0) {
            message = `No Vaccine slots were available in last 1hr.`;
            SNSsend(message);
            console.log('Sent Notification to Phone \nStopping Pinger...');
        } else {
            console.log("NO slots available ", pingCount, " ", JSON.stringify(centers));
        }
    }).catch((err) => {
        console.log("Error: " + err.message);
    });
}


let pingCount = 0;
var timer = setInterval(() => {
    console.clear();
    pingCount += 1;
    pingCowin(pingCount);
    console.log("Ping Count - ", pingCount);
}, intervalInMs);