//--mongoose--
const announceSchema = require('./AnnounceSchema') //---this is for being able to accces another JS file-----

// ----Import server.js
const serverJs = require('./server')

const mongoose = require('mongoose');
const { log } = require('console');
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')

//----- Farsi Jalali Date ----------
var moment = require('moment-jalaali')

function getDate(){
    //----- Farsi Jalali Date ----------
const d = new Date()
var faDate = (new Intl.DateTimeFormat('fa-IR', {dateStyle: 'full', timeStyle: 'short'}).format(d))
return faDate
}


//---- Create new Announce
async function createNewAnnounce(msg){
    try {
        let json = JSON.parse(msg);
       console.log(json)
        // do something with JSON
        checkAnnounceBeforeCreating();
        async function checkAnnounceBeforeCreating(){
            //------search database --------
try {
    const announceExists = await announceSchema.exists({ announceCode: json.announceCode })
    if (announceExists) {
        console.log('announce already exists')
        const createNewAnnounceAlready = {
            status: "failed",
            success: "false",
            message: "این پیام از قبل موجود است",
        }
        const jsonContent = JSON.stringify(createNewAnnounceAlready);
        serverJs.socketEmit(json.phoneNumber,'createNewAnnounceStatus', jsonContent);
    }else{
        console.log('announce doesnt exist, Creating new announce...')
        const newAnnounce = await announceSchema.create({ 
            announceCode: json.announceCode,
            title: json.announceTitle,
            isActive: json.announceIsActive,
            description: json.announceDesc,
            createdAt:  getDate(),
         });
         const createNewAnnounceMsg = {
            status: "done",
            success: "true",
            message: "پیام با موفقیت اضافه شد",
        }
        const jsonContent = JSON.stringify(createNewAnnounceMsg);
        serverJs.socketEmit(json.phoneNumber,'createNewAnnounceStatus', jsonContent)
        console.log('Announce Successfuly Created')
    }

} catch (error) {
    console.log(error.message)
                    const createNewAnnounceError = {
                        status: "failed",
                        success: "false",
                        message: "خطای ناشناس",
                    }
                    const jsonContent = JSON.stringify(createNewAnnounceError);
                    serverJs.socketEmit(json.phoneNumber,'createNewAnnounceStatus', jsonContent)
}
        };

    } catch (error) {
        console.error(error.message);
        const createNewAnnounceError = {
            status: "failed",
            success: "false",
            message: "خطا در ساخت پیام",
        }
        const jsonContent = JSON.stringify(createNewAnnounceError);
        serverJs.socketEmit(json.phoneNumber,'createNewAnnounceStatus', jsonContent)
    };



}


//------- get announce list from db and send to client ---------
async function GetAnnounceList(msg){
try {
    let json = JSON.parse(msg);
    const myData = await announceSchema.find({});
    for (let index = 0; index < myData.length; index++) {
        const jsonData = {
            announceCode: myData[index].announceCode,
            title: myData[index].title,
            isActive: myData[index].isActive,
            description: myData[index].description,
            createdAt: myData[index].createdAt
        }
        const jsonContent = JSON.stringify(jsonData);
        serverJs.socketEmit(json.phoneNumber,'GetAnnounceListResp', jsonContent);
    }
    } catch (error) {
    }
}





async function GetTotalAnnouncements(clientNumber){
    try {
        const myData = await announceSchema.find({});
        serverJs.socketEmit(clientNumber,'totalAnnouncementsResp', myData.length);
        } catch (error) {
        
        }
    }


    //-------- Remove Announce -----------
async function RemoveAnnounce(clientNumber,msg){
try {
    const delAnnounce = await announceSchema.deleteOne({ announceCode: msg })
    if(delAnnounce.acknowledged){
serverJs.socketEmit(clientNumber,'delAnnounceResp', "success");
    }else{
        serverJs.socketEmit(clientNumber,'delAnnounceResp', "failed");
    }
} catch (error) {
    serverJs.socketEmit(clientNumber,'delAnnounceResp', "failed");
    }
}


// ---------- edit Announce --------------
async function EditAnnounce(msg){
    try {
        let json = JSON.parse(msg);
        const editAnnounce = await announceSchema.updateOne({announceCode: json.announceCode},
            {$set:{title: json.announceTitle , isActive: json.announceIsActive , description: json.announceDesc }});
        serverJs.socketEmit(json.phoneNumber,'changeAnnounceResp', editAnnounce.acknowledged.toString());
        } catch (error) {
        
        }
    }

// export functions to be accessable from anywhere
module.exports.createNewAnnounce = createNewAnnounce
module.exports.GetAnnounceList = GetAnnounceList
module.exports.GetTotalAnnouncements = GetTotalAnnouncements
module.exports.RemoveAnnounce = RemoveAnnounce
module.exports.EditAnnounce = EditAnnounce
