/*********************************************************************************
* BTI325 – Assignment https://damp-beach-98200.herokuapp.com/
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tanvir Singh  Student ID: 104642210  Date: 2022-11-12
*
* Online (cyclic) url:https://easy-teal-chipmunk-tutu.cyclic.app/
* _______________________________________________________
*
********************************************************************************/
var fs = require('fs');
var express = require('express');
const path  = require('path');


const Sequelize = require('sequelize');
var sequelize = new Sequelize('qliwgerd', 'qliwgerd', 'hDCpEx8eytzZE_cl1Cdb6GIT_29AlhlT', {
    host: 'babar.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

    var Employee = sequelize.define('Employee', {

        employeeNum: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addressCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,  
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING
    
        },{
    
            createdAt: false, 
            updatedAt: false 
    
    });
    
  
    var Department = sequelize.define('Department', {
    
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    
        departmentName: Sequelize.STRING
    
        },{
    
        createdAt: false, 
        updatedAt: false 
    
    });
    
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
     sequelize.sync().then(function(){
        resolve();
     }).catch(function(){
        reject("unable to sync the database");
     })
})
}


module.exports.getAllEmployees = function () {

    return new Promise(function (resolve, reject) {

    Employee.findAll().then(function(data){
        resolve(data);
    }).catch(function(){
        reject("no results returned");
    })
    })
}
module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll().then(function(data){
           
            resolve(data);

        }).catch(function(){
            reject("no results returned");
        })
    })
}

module.exports.getManagers = function () {

    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{isManager:true} }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        })
    })
}

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for(const property in employeeData)
        {
            if(employeeData[property] == "")
            {
                employeeData[property] = null
            }
        }
        console.log(employeeData);
        Employee.create(employeeData).then(function()
        {
            resolve();
        }
        ).catch(function()
        {
            reject("unable to create employee");
        })
    })
}
module.exports.addDepartment = function(departmentData)
{
    return new Promise(function (resolve, reject) {
      
        for(const property in departmentData)
        {
            if(departmentData[property] == "")
            {
                departmentData[property] = null
            }
        }
        Department.create(departmentData).then(function()
        {
            resolve();
        }
        ).catch(function()
        {
            reject("unable to create department");
        })
    })
}
module.exports.getEmployeesByStatus = function (stat) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{status:stat} }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        })
    })


}

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{department:department} }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        })
    })



}
module.exports.getEmployeesByManager = function (manager) {
    
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeManagerNum:manager} }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        })
    })

}


module.exports.getEmployeeByNum = function (nump) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeNum:nump} }).then(function(data){
            resolve(data[0] );
        }).catch(function(){
            reject("no results returned");
        })
    })


}
module.exports.getDepartmentById = function (nump) {
    return new Promise(function (resolve, reject) {
        Department.findAll({where:{departmentId:nump} }).then(function(data){
            resolve(data[0]);
        }).catch(function(){
            reject("no results returned");
        })
    })


}
module.exports.updateEmployee = function(employeeData)
{
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for(const property in employeeData)
        {
            if(employeeData[property] == "")
            {
                employeeData[property] = null
            }
        }
        Employee.update(employeeData,{where:{employeeNum: employeeData.employeeNum}}).then(function()
        {
            resolve();
        }
        ).catch(function()
        {
            reject("unable to update employee");
        })
    })
}

module.exports.updateDepartment = function(departmentData)
{
    console.log(departmentData);
    return new Promise(function (resolve, reject) {
       
        for(const property in departmentData)
        {
            if(departmentData[property] == "")
            {
                departmentData[property] = null
            }
        }
        Department.update(departmentData,{where:{departmentId: departmentData.departmentId}}).then(function()
        {
            resolve();
        }
        ).catch(function()
        {
            reject("unable to update Department");
        })
    })
}

module.exports.deleteEmployeeByNum = function(empNum)
{
    return new Promise(function (resolve, reject) {
    
        Employee.destroy({where:{employeeNum: empNum}}).then(function()
        {
        
            resolve();

        }
        ).catch(function()
        {
            reject("unable to Delete employee");
        })
    })
}