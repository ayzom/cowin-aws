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

SNSsend("hi");
