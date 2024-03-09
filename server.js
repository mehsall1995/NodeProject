const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const socket = require('socket.io');
const fs = require('fs');
const app = express();
app.use(express.static("public"));
var PORT = process.env.PORT || 3000;
const server = app.listen(PORT);
console.log('server is running');
const io = socket(server);

app.set('view engine', 'ejs')


//--- Import Limo Sms
const limosms = require('./limosms')

//--- import ProductHandler
const productHandler = require('./ProductHandler');

//--- import AnnounceHandler
const AnnounceHandler = require('./AnnounceHandler');

//--- import UserHandler
const UserHandler = require('./UserHandler');


//--mongoose--
//const User = require('./User') //---this is for being able to accces another JS file-----
const mongoose = require('mongoose');
const { log } = require('console');
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')


/*  ----------- web page  ---------------  */
app.get('/', (req, res) => {
    res.render("homepage.ejs")
});
app.get('/admin', (req, res) => {
   // res.redirect('/')
    res.render("sign-in.ejs")
});
app.get('/dashboard', (req, res) => {
    // res.redirect('/')
     res.render("dashboard.ejs")
 });
 app.get('/profile', (req, res) => {
    // res.redirect('/')
     res.render("profile.ejs")
 });
 app.get('/admin/products', (req, res) => {
    // res.redirect('/')
     res.render("products.ejs")
 });
 app.get('/admin/announcements', (req, res) => {
    // res.redirect('/')
     res.render("announcements.ejs")
 });
 app.get('/notifications', (req, res) => {
    // res.redirect('/')
     res.render("notifications.ejs")
 });




//-----Authenticate if client have a valid phone number-------
/*io.use((socket, next) => {
    const phonenumber = socket.handshake.auth.phoneNumber;
    console.log(phonenumber)
    if (!phonenumber) {
        console.log('User doesnt have a valid phone number');
        return next(new Error('connect_error'));
    } else {
        console.log('User have valid number, moving to next functions...')
        next();
    }
   
});*/

const client ={}

io.on("connection", (socket) => {
    console.log('new socket connection: ' + socket.id)


    socket.on('disconnect', (reason) => {
        console.log('user disconnected ' + socket.id + '  reason  ' + reason);
        delete client[socket.id];
    });

//----- Global function to use socket.io in other places
const socketEmit = (clientNumber,fName, data) =>{
    io.to(client[clientNumber]).emit(fName,data)
    }
    module.exports.socketEmit = socketEmit


    //-----here we handle custom received event and its value-------@mehsall1995
    socket.on('counter', (msg) => {
        io.to(client[clientNumber]).emit(fName,data)
    });
    //------ logMeIn function ---------
    socket.on('logMeIn', (msg) => {
        let json = JSON.parse(msg);
         // ------- save unique socket id according to client phone number
         client[json.phoneNumber] = socket.id;
        socket.phoneNumber = json.phoneNumber
        socket.evaluationCode = json.evaluationCode
      UserHandler.logMeIn(msg)
    });

    //------------send evaluation code to client using SMS -----------
    socket.on('sendEvaluationCode', (msg) => {
        console.log('message: ' + msg);
        socket.phoneNumber = msg;
        client[socket.phoneNumber] = socket.id;
        limosms.sendEvCode(msg)
    });

    //---- evaluate received code from client ---------
    socket.on('evaluateSentCode', (msg) => {
        limosms.checkCode(socket.phoneNumber,msg)
    });


    socket.on('userExists?', (msg) => {//--Check if user exists in database with given phoneNumber
        socket.phoneNumber = msg;
        UserHandler.userExists(msg);
    })

    //------- Update User Info --------
    async function updateUserEvCode(phoneNumber,evCode){
    UserHandler.updateEvCode(phoneNumber,evCode);
    }
    module.exports.updateUserEvCode = updateUserEvCode



    //----- Crate new user 
    socket.on('createNewUser', (msg) => {
        UserHandler.createNewUser(msg);
    })


    //----- Crate new product
    socket.on('createNewProduct', (msg) => {
        // first send received data to "createProduct" script
        productHandler.createNewProduct(msg);
    })

// ------ get products list from database ----------
    socket.on('GetProductsList', (msg) =>{
productHandler.GetProductsList(msg);
    });


    //---------- get some info from database and send to client dashboard  ------------
    socket.on('GetSomeInfo', (msg)=>{
        productHandler.GetTotalProducts(msg);
        UserHandler.GetTotalUsers(msg);
    });

    // -------- remove product -------
    socket.on('removeProduct', (msg) =>{
try {
    let json = JSON.parse(msg)
    productHandler.RemoveProduct(json.phoneNumber, json.productId);
} catch (error) {
    
}

      

    });
    // -------- edit product ------------
    socket.on('editProduct', (msg) =>{
    productHandler.EditProduct(msg);
 
     });


     // ----- get user info ----------
     socket.on('GetUserInfo', (msg)=>{
        UserHandler.getUserInfo(msg);
     });


      // ----- update user info ----------
      socket.on('updateUserInfo', (msg)=>{
        UserHandler.updateUserInfo(msg);
     });

 // ----- add user address ----------
 socket.on('addUserAddress', (msg)=>{
   UserHandler.addUserAddress(msg);
 });

 // ----- Get Address List ----------
 socket.on('GetAddressList', (msg)=>{
    UserHandler.GetAddressList(msg);
  });
 

 // ----- update user address ----------
 socket.on('updateUserAddress', (msg)=>{
UserHandler.updateUserAddress(msg);
 });
  // ----- delete user address ----------
  socket.on('deleteUserAddress', (msg)=>{
    UserHandler.deleteUserAddress(msg);
     });




 // -------- create new announce ------------
 socket.on('createNewAnnounce', (msg) =>{
    AnnounceHandler.createNewAnnounce(msg);
     });

 // -------- get announce list ------------
 socket.on('GetAnnounceList', (msg) =>{
    AnnounceHandler.GetAnnounceList(msg);
     });

         // -------- remove announce -------
    socket.on('removeAnnounce', (msg) =>{
        try {
            let json = JSON.parse(msg)
            AnnounceHandler.RemoveAnnounce(json.phoneNumber, json.announceId);
        } catch (error) {
            
        }
    });
// -------- edit announce ------------
socket.on('editAnnounce', (msg) =>{
    AnnounceHandler.EditAnnounce(msg);
     });
// -------- get total announce ------------
socket.on('GetTotalAnnouncements', (msg) =>{
    AnnounceHandler.GetTotalAnnouncements(msg);
     });






});