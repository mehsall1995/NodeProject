//LimoSMS
const axios = require('axios');
var footerText = "مگا اپلیکیشن شیپانو";

// ----Import server.js
const serverJs = require('./server')
const myKey = "9a43a9de-f344-46d5-9009-935c2a52906f"


//----Send evaluation code to phone number
const sendEvCode =(phoneNumber) =>{
    axios.post('https://api.limosms.com/api/sendcode', {
            "Mobile": phoneNumber,
            "Footer": footerText
           }, {
            headers: {
                ApiKey: myKey
            }
            }).then(function (response) {
            console.log(response.data.success);
            console.log(response.data.message);
            if (response.data.success == true) {
                //socket.emit('sendEvaluationCodeStatus', 'true')
                serverJs.socketEmit(phoneNumber,'sendEvaluationCodeStatus', 'true')
            } else {
                //socket.emit('sendEvaluationCodeStatus', 'false')
                serverJs.socketEmit(phoneNumber,'sendEvaluationCodeStatus', 'false')
            }
         })
            .catch(function (error) {
                console.log(error);
                //socket.emit('sendEvaluationCodeStatus', 'false') //--default is false
                serverJs.socketEmit(phoneNumber,'sendEvaluationCodeStatus', 'true') //--default is false
            });

    }

    //------ Check sent code
    const checkCode = (phoneNumber,code) =>{
    axios.post('https://api.limosms.com/api/checkcode', {
        "Mobile": phoneNumber,
        "Code": code
    }, {
        headers: {
            ApiKey: myKey
        }
    }).then(function (response) {
        console.log(response.data);
        if (response.data.success == true) {
            serverJs.socketEmit(phoneNumber,'evaluateSentCodeStatus', 'true')
            serverJs.updateUserEvCode(phoneNumber,code)
        } else {
            serverJs.socketEmit(phoneNumber,'evaluateSentCodeStatus', 'false')
        }
    })
        .catch(function (error) {
            console.log(error);
            serverJs.socketEmit(phoneNumber,'evaluateSentCodeStatus', 'true') //--defult is false
        });
    }



    //---- Export function to make it reachable in other places
    module.exports.sendEvCode = sendEvCode
    module.exports.checkCode = checkCode
