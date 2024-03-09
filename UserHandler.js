//--mongoose--
const userSchema = require('./User') //---this is for being able to accces another JS file-----

// ----Import server.js
const serverJs = require('./server')

const mongoose = require('mongoose');
const { log } = require('console');
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')


  //------ logMeIn function ---------
  async function logMeIn(msg){
    try {
        let json = JSON.parse(msg);
        console.log(json)
        if (json.phoneNumber == "" || json.evaluationCode == "") {
            serverJs.socketEmit(json.phoneNumber,'logMeInResp', 'failed');
        } else {
            //-- search db for phone and evaluation code
            searchDb()
            async function searchDb() { //-- query search ---
                try {
                    const search = await userSchema.where("phone").equals(json.phoneNumber).select("evaluationcode")
                    if (search == "") {
                        console.log('User Not found')
                        serverJs.socketEmit(json.phoneNumber,'logMeInResp', 'failed');
                    } else {
                        if (json.evaluationCode == search[0].evaluationcode) {
                            // search[0].evaluationcode is from DataBase
                            // socket.evaluationCode is from client(user)
                            console.log('Login permition granted')
                            serverJs.socketEmit(json.phoneNumber,'logMeInResp', 'granted');
                            
                        } else {
                            console.log('evaluationcode doesnt match')
                            serverJs.socketEmit(json.phoneNumber,'logMeInResp', 'failed');
                            console.log('evCode from DB: ' + search[0].evaluationcode)
                        }
                    }
                    
                } catch (e) {
                    console.log(e.message)
                }
            }
        }
       
    } catch (error) {
        console.error(error.message);
        serverJs.socketEmit(json.phoneNumber,'logMeInResp', 'failed'); 
    };
}

//-- check if user exists ------
async function userExists(msg){
    try {
        const userExists = await userSchema.exists({ phone: msg })
        if (userExists) {
            console.log('userExists : true')
            serverJs.socketEmit(msg,'userExists', 'true'); 
        } else {
            console.log('userExists : false')
            serverJs.socketEmit(msg,'userExists', 'false'); 
        }
    } catch (e) {
        console.log(e.message) 
    }
}

///- ---- update user evaluation code ----------
async function updateEvCode(phoneNumber,evCode){
    const filter = { phone: phoneNumber };
    const update = { evaluationcode: evCode };
    let doc = await userSchema.findOneAndUpdate(filter, update);
}


//------ create new user ------
async function createNewUser(msg){
    try {
        let json = JSON.parse(msg);
        // do something with JSON
        checkUserBeforeCreating()
        async function checkUserBeforeCreating() {
            try {
                const userExists = await userSchema.exists({ phone: json.phoneNumber })
                if (userExists) {
                    console.log('user already exists')
                    const createNewUserAlready = {
                        status: "failed",
                        success: "false",
                        message: "User Already Exists In Database",
                    }
                    const jsonContent = JSON.stringify(createNewUserAlready);
                    serverJs.socketEmit(json.phoneNumber,'createNewUserStatus', jsonContent); 
                    
                } else {
                    console.log('user doesnt exist, Creating new user...')
                    createNewUser()
                    async function createNewUser() {
                    const user = await userSchema.create({
          phone: json.phoneNumber,
          evaluationcode: json.evaluationCode,
          name: json.name,
          lastname: json.lastName,
          gender: json.gender,
          balance: 0,
          email: "",
          nationalId: 0,
      })

      const createNewUserMsg = {
          status: "done",
          success: "true",
          message: "User Successfuly Created",
      }
      const jsonContent = JSON.stringify(createNewUserMsg);
      serverJs.socketEmit(json.phoneNumber,'createNewUserStatus', jsonContent); 
      console.log('User Successfuly Created')

  }
                }
            } catch (e) {
                console.log(e.message)
                const createNewUserError = {
                    status: "failed",
                    success: "false",
                    message: "Unexpected Error",
                }
                const jsonContent = JSON.stringify(createNewUserError);
                serverJs.socketEmit(json.phoneNumber,'createNewUserStatus', jsonContent); 
            }

        }


    } catch (error) {
        console.error(error.message);
        const createNewUser = {
            status: "failed",
            success: "false",
            message: "Error while creating new user",
        }
        const jsonContent = JSON.stringify(createNewUser);
        serverJs.socketEmit(json.phoneNumber,'createNewUserStatus', jsonContent); 
    };
}

//----get total users----
async function GetTotalUsers(msg){
    try {
        const totalUsers = await userSchema.find({});
        serverJs.socketEmit(msg,'totalUsersResp', totalUsers.length); 
    } catch (error) {
        console.log(error);
    }
    
}

//------ get user info -------
async function getUserInfo(msg){
    const myData = await userSchema.find({phone: msg});
    const userData ={
        name: myData[0].name,
        lastname: myData[0].lastname,
        gender: myData[0].gender,
        evaluationcode: myData[0].evaluationcode,
        balance: myData[0].balance,
        nationalId: myData[0].nationalId,
        email: myData[0].email,

    }
    const userDataJson = JSON.stringify(userData);
    serverJs.socketEmit(msg,'GetUserInfoResp', userDataJson); 
}


//------ update user info -----
async function updateUserInfo(msg){
    try {
        let json = JSON.parse(msg);
        const updateUser = await userSchema.updateOne({phone: json.phoneNumber},
            {$set:{name: json.name, lastname: json.lastName, nationalId: json.nationalId, gender: json.gender, email: json.email, }});
            serverJs.socketEmit(json.phoneNumber,'updateUserInfoResp', updateUser.acknowledged.toString()); 
      //console.log(updateUser)
        } catch (error) {
        console.log(error)
        }
   }


    // ----- add user address ----------
    async function addUserAddress(msg){
        try {
            let json = JSON.parse(msg);
            newAddress = {
                title: json.title,
                latitude: json.latitude,
                longitude: json.longitude,
                state: json.state,
                city: json.city,
                neighbourhood: json.neighbourhood,
                address: json.address,
            }
            const addressExists = await userSchema.exists({phone: json.phoneNumber, "addresses.title": json.title});
          if(addressExists){
            serverJs.socketEmit(json.phoneNumber,'addUserAddressResp', "exists"); 
          }else{
            const addAddress = await userSchema.updateOne({phone: json.phoneNumber},
            {$addToSet: { addresses: newAddress }});
            serverJs.socketEmit(json.phoneNumber,'addUserAddressResp', addAddress.acknowledged.toString());
          }
            } catch (error) {
            console.log(error)
            }
       }


       async function GetAddressList(msg){
            const addressList = await userSchema.findOne({phone: msg,"addresses.title": { $exists: true }});
            if(addressList != null){
            for (let index = 0; index < addressList.addresses.length; index++) {
                const jsonData = {
                    addressTitle: addressList.addresses[index].title,
                    addressDesc: addressList.addresses[index].address,
                }
                 jsonContent = JSON.stringify(jsonData);
                 serverJs.socketEmit(msg,'GetAddressListResp',jsonContent );
            }     
        }
       }


       //------- Update User Address ---------
       async function updateUserAddress(msg){
        try {
            let json = JSON.parse(msg);
            newAddress = {
                title: json.newTitle,
                address: json.desc
            }
            const updateAddress = await userSchema.updateOne({phone: json.phoneNumber, "addresses.title": json.oldTitle},
                {$set: { "addresses.$.title": json.newTitle, "addresses.$.address": json.desc, }}
                );
             serverJs.socketEmit(json.phoneNumber,'updateUserAddressResp', updateAddress.acknowledged.toString() );
            } catch (error) {
            console.log(error)
            }
       }

         //------- Delete User Address ---------
         async function deleteUserAddress(msg){
            console.log("deleting address...")
            try {
                let json = JSON.parse(msg);
                const deleteAddress = await userSchema.updateOne({phone: json.phoneNumber, "addresses.title": json.title},
                {$pull : { "addresses" : {"title":json.title} } }
                    );
              serverJs.socketEmit(json.phoneNumber,'deleteUserAddressResp', deleteAddress.acknowledged.toString() );
                } catch (error) {
                console.log(error)
                }
           }


// export functions to be accessable from anywhere
module.exports.logMeIn = logMeIn
module.exports.userExists = userExists
module.exports.updateEvCode = updateEvCode
module.exports.createNewUser = createNewUser
module.exports.GetTotalUsers = GetTotalUsers
module.exports.getUserInfo = getUserInfo
module.exports.updateUserInfo = updateUserInfo
module.exports.addUserAddress = addUserAddress
module.exports.GetAddressList = GetAddressList
module.exports.updateUserAddress = updateUserAddress
module.exports.deleteUserAddress = deleteUserAddress
