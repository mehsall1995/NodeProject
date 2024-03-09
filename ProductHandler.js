//--mongoose--
const productSchema = require('./ProductSchema') //---this is for being able to accces another JS file-----

// ----Import server.js
const serverJs = require('./server')

const mongoose = require('mongoose');
const { log } = require('console');
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')


//---- Create new product
async function createNewProduct(msg){
    try {
        let json = JSON.parse(msg);
       console.log(json)
        // do something with JSON
        checkProductBeforeCreating();
        async function checkProductBeforeCreating(){
            //------search database --------
try {
    const productExists = await productSchema.exists({ productCode: json.productCode })
    if (productExists) {
        console.log('product already exists')
        const createNewProductAlready = {
            status: "failed",
            success: "false",
            message: "این محصول از قبل موجود است",
        }
        const jsonContent = JSON.stringify(createNewProductAlready);
        serverJs.socketEmit(json.phoneNumber,'createNewProductStatus', jsonContent);
    }else{
        console.log('product doesnt exist, Creating new product...')
        const newProduct = await productSchema.create({ 
            category: json.productCategory,
            subCategory: json.productSubCategory,
            productCode: json.productCode,
            name: json.productName,
            price: json.productPrice,
            isActive: json.productIsActive,
            description: json.productDesc,
         });
         const createNewProductMsg = {
            status: "done",
            success: "true",
            message: "محصول با موفقیت اضافه شد",
        }
        const jsonContent = JSON.stringify(createNewProductMsg);
        serverJs.socketEmit(json.phoneNumber,'createNewProductStatus', jsonContent)
        console.log('Product Successfuly Created')
    }

} catch (error) {
    console.log(error.message)
                    const createNewProductError = {
                        status: "failed",
                        success: "false",
                        message: "خطای ناشناس",
                    }
                    const jsonContent = JSON.stringify(createNewProductError);
                    serverJs.socketEmit(json.phoneNumber,'createNewProductStatus', jsonContent)
}
        };

    } catch (error) {
        console.error(error.message);
        const createNewProductError = {
            status: "failed",
            success: "false",
            message: "خطا در ساخت محصول",
        }
        const jsonContent = JSON.stringify(createNewProductError);
        serverJs.socketEmit(json.phoneNumber,'createNewProductStatus', jsonContent)
    };



}


//------- get products list from db and send to client ---------
async function GetProductsList(msg){
try {
    let json = JSON.parse(msg);
    const myData = await productSchema.find({category: json.category});
   // console.log(myData.length);
    //console.log(myData[0].category);

    for (let index = 0; index < myData.length; index++) {
        const jsonData = {
            category: myData[index].category,
            subCategory: myData[index].subCategory,
            productCode: myData[index].productCode,
            name: myData[index].name,
            price: myData[index].price,
            isActive: myData[index].isActive,
            description: myData[index].description,
        }
        const jsonContent = JSON.stringify(jsonData);
        serverJs.socketEmit(json.phoneNumber,'GetProductsListResp', jsonContent);
    }

   
    } catch (error) {
    
    }
}





async function GetTotalProducts(clientNumber){
    try {
        const myData = await productSchema.find({});
        console.log(myData.length);
        serverJs.socketEmit(clientNumber,'totalProductsResp', myData.length);
        } catch (error) {
        
        }
    }


    //-------- Remove Product -----------
async function RemoveProduct(clientNumber,msg){
try {
    const delProduct = await productSchema.deleteOne({ productCode: msg })
    if(delProduct.acknowledged){
serverJs.socketEmit(clientNumber,'delProductResp', "success");
    }else{
        serverJs.socketEmit(clientNumber,'delProductResp', "failed");
    }
} catch (error) {
    serverJs.socketEmit(clientNumber,'delProductResp', "failed");
    }
}


// ---------- edit product --------------
async function EditProduct(msg){
    try {
        let json = JSON.parse(msg);
        const editProduct = await productSchema.updateOne({productCode: json.productCode},
            {$set:{name: json.productName , price: json.productPrice , isActive: json.productIsActive , description: json.productDesc }});
        serverJs.socketEmit(json.phoneNumber,'changeProductResp', editProduct.acknowledged);
        } catch (error) {
        
        }
    }

// export functions to be accessable from anywhere
module.exports.createNewProduct = createNewProduct
module.exports.GetProductsList = GetProductsList
module.exports.GetTotalProducts = GetTotalProducts
module.exports.RemoveProduct = RemoveProduct
module.exports.EditProduct = EditProduct
