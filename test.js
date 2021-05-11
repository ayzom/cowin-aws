var AWS = require("aws-sdk");
var sns = new AWS.SNS();

function SNSsend(message) {
    return sns.publish({
      
      //////// change SNS ARN below //////////////////////////
      
      TopicArn: "arn:aws:sns:ap-south-1:285535506992:aws-cowin-mumbai",
      
      Message: JSON.stringify(message)
      }, function(err, data) {
          if(err) {
              console.error('error publishing to SNS');
              context.fail(err);
          } else {
              console.info('message published to SNS');
              context.succeed(null, data);
          }
      });
}

SNSsend("hi");
