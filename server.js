/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tanvir Singh  Student ID: 104642210  Date: 2022-11-12
*
* Online (Cyclic) URL:https://easy-teal-chipmunk-tutu.cyclic.app/
* _______________________________________________________
*
********************************************************************************/
const express = require("express"); // Include express.js module
const app = express();
const exphbs = require("express-handlebars");
var data = require('./data-service.js')
const dataServiceAuth = require("./data-service-auth.js");
const multer = require("multer");
var fs = require('fs');
var path = require("path"); // include moduel path to use __dirname, and function path.join()
const { stringify } = require("querystring");
var clientSessions = require("client-sessions");
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "Assignment6_", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));
  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
   });
   function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

//var data = require('data-service.js');


// tell server to use handlebars as the the template engine
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +

                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}))
app.set("view engine", ".hbs");
app.use(express.urlencoded({ extended: true }));
const dstorage = multer.diskStorage({
    destination: './public/images/uploaded',
    filename: function (req, file, cb) {

        cb(null, Date.now() + path.extname(file.originalname));
    }
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: dstorage });
var HTTP = process.env.PORT || 8080;  // || : or
app.use(express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});
app.get('/', function (req, res) {
    res.render("home");
})
app.get('/about', function (req, res) {
    res.render("about");
})

app.get('/employees/add', function (req, res) {
    data.getDepartments().then(function (data) {
        console.log(data);
        res.render("addEmployee", { departments: data });
    }).catch(function () {
        res.render("addEmployee", { departments: [] });
    })

})
app.post("/employees/add", function (req, res) {
    data.addEmployee(req.body).then(function () {
        res.redirect("/employees");
    })

})
app.get('/departments/add', function (req, res) {

    res.render("addDepartment");
})

app.get('/images/add', function (req, res) {
    res.render("addImage");
})
app.get('/employees', function (req, res) {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then(function (msg) {
            res.render("employees", { employees: msg });
        }).catch(function (message) {

            console.log(`Error: ${message}`)
            res.json(`Error: ${message}`)
        })


    }
    else if (req.query.department) {

        data.getEmployeesByDepartment(req.query.department).then(function (msg) {
            res.render("employees", { employees: msg })
        }).catch(function (message) {

            console.log(`Error: ${message}`)
            res.json(`Error: ${message}`)
        })
    }
    else if (req.query.manager) {

        data.getEmployeesByManager(req.query.manager).then(function (msg) {
            res.render("employees", { employees: msg })
        }).catch(function (message) {

            console.log(`Error: ${message}`)
            res.json(`Error: ${message}`)
        })
    }
    else {
        data.getAllEmployees().then(function (message) {
            //  res.json(message);
            if (message.length > 0)
                res.render("employees", { employees: message })
            else {

                res.render("employees", { message: "no results" });
            }
        }).catch(function (error) {

            res.render("employees", { message: error });
        })
    }
})
app.get('/departments', function (req, res) {

    data.getDepartments().then(function (message) {
        if (message.length > 0)
            res.render("departments", { department: message });
        else
            res.render("departments", { message: "No results found" });

    }).catch(function (error) {
        console.log("hello")
        res.render("departments", { message: error });
    })
})
app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(data.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as
            "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object

            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

app.get('/department/:value', function (req, res) {

    data.getDepartmentById(req.params.value).then(function (msg) {
        //console.log(msg);
        res.render("department", { department: msg })
    }).catch(function (message) {
        res.status(404).send("Department Not Found");
    })
})
app.get('/Managers', function (req, res) {

    data.getManagers().then(function (msg) {
        if(msg.length> 0)
        {
            res.render("employees", { employees: msg })
        }
        else{
            res.render("employees",{employees: "no results found"})
        }
     
    }).catch(function (message) {
        res.status(404).send("manager Not Found");
    })
})

app.post("/images/add", upload.single("imageFile"), function (req, res) {
    res.redirect("/images");
})



app.post("/departments/add", function (req, res) {
    data.addDepartment(req.body).then(function () {
        res.redirect("/departments");
    })

})


app.post("/images/add", upload.single("imageFile"), function (req, res) {
    res.redirect("/images");
})



app.get("/images", function (req, res) {
    fs.readdir("./public/images/uploaded", function (err, items) {
        if (err) {
            res.send(err);
        }
        else {
            var data = {
                items
            }
            res.render("images", { ABC: data.items });
        }
    })
})


app.get(function (req, res) {
    res.status(404).send("Page not Found")
})


app.post("/employee/update", (req, res) => {

    data.updateEmployee(req.body).then(function () {
        res.redirect("/employees");
    }).catch(function(err){
        res.status(500).send("Unable to Update Employee");
    })
})

app.post("/department/update", (req, res) => {

    data.updateDepartment(req.body).then(function () {
        res.redirect("/departments");
    }).catch(function(err){
        res.status(500).send("Unable to Update Department");
    })
})
app.get("/employees/delete/:value",(req, res) => {
 data.deleteEmployeeByNum(req.params.value).then(function(){
    res.redirect("/employees");
 }).catch(function(){
    res.status(500).send("Unable to Remove Employee / Employee not found")
 })
})
app.get("/login",(req,res)=>{
   
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
        userName: user.userName, // complete it with authenticated user's userName
        email: user.email ,// complete it with authenticated user's email
        loginHistory: user.loginHistory// complete it with authenticated user's loginHistory
        }
        res.redirect('/employees');
       }).catch(function(err){
        res.render("login", {errorMessage : err, userName : req.body.userName});
       })
       
})
app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect("/");
})
app.get("/userHistory",ensureLogin,(req,res)=>{
    res.render("userHistory");
})

app.post("/register",(req,res)=>{
    dataServiceAuth.registerUser(req.body).then(function(){
        

        res.render("register", {successMessage : "User Created"});

     }).catch(function(err){

           res.render("register", {errorMessage : err, userName : req.body.userName})

     });
})
data.initialize().then(function () {
    dataServiceAuth.initialize().then(function(){

        app.listen(HTTP, function () {

            console.log("Express http server listening on: " + HTTP);
        });
    
      }).catch(function(err){
    
        console.log("Unable to start server : " + err);
    
      
    });
 }).catch(function (err) {
     console.log("Error: " + err);
})

