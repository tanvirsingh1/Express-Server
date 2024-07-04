var mongoose = require("mongoose");
const { initialize } = require("./data-service");
const bcrypt = require('bcryptjs');
const e = require("express");
var Schema = mongoose.Schema;


var User;
var companySchema = new Schema({

    "userName": { 
        type: String,
        unique: true
      },
    "password":String,
    "email":String,
    "loginHistory":[{"dateTime": Date,"userAgent":String}]
})
module.exports.initialize = function(){
    return new Promise(function (resolve, reject) {
    let db1 = mongoose.createConnection("mongodb+srv://Tanvir:Tanvir1234@cluster1.6yf8sqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1",{ useNewUrlParser: true, useUnifiedTopology: true }, function(error){
        if(error)
        {
        reject("db1 error! " + error);
        }
        else 
        {
            User = db1.model("user",companySchema);
            resolve("connection1 successful");
        }
    }); 
})
}

module.exports.registerUser = function(userData){
    return new Promise(function (resolve, reject) {

        if(userData.password === null || userData.password.match(/^ *$/) !== null)
        {
            reject("Error: user name cannot be empty or only white spaces!");
        }
        
        if (userData.password != userData.password2){
            reject("Passwords do not match!")
        }
        
        else{
  var newUser = new User(userData);

bcrypt.hash(newUser.password, 10).then(hash=>{ 
    newUser.password = hash;
    newUser.save().then(() => {
        console.log("saved successfully");
        resolve();
      }).catch(err => {
      
if(err.code == 11000)
reject(`Error: ${userData.userName} already exists`);
      else
        reject("Error: cannot create the user");
      });

})
.catch(err=>{
    
   
    reject("Encryption error occured "+ err);
});
        }
    }) 
}

exports.checkUser = function(userData){

    return new Promise(function(resolve,reject){

        User.findOne({userName : userData.userName}).exec().then(function(user){
                bcrypt.compare(userData.password, user.password).then(function(flag){
                    if (!flag){

                        reject("Passwords do not match for : "
                        +user.userName);
                    }
                    else{ 
                           
                        user.loginHistory.push({dateTime : new Date().toString(), userAgent : userData.userAgent});
                   
                
                        User.update({userName : user.userName},  { $set: {loginHistory: user.loginHistory}}).exec().then(function(){
                                resolve(user);

                            }).catch(function(err){
                                    reject("There was an error verifying the user : " + err);
                            })

                        }

                 }).catch(function(err){
                     reject("Error in Encrytion : "  + err);
                 })


                }).catch(function(err){
                reject("Unable to find user : " + userData.userName);

        });

})}