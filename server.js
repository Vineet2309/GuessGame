const dotenv=require('dotenv') ;
dotenv.config();
const path=require('path');
const express=require('express');
const fs=require('fs');
const app=express();
const bcrypt=require('bcrypt');
const mysql=require('mysql2');
const PORT=process.env.PORT||5500;
app.use(express.json());
app.use(express.urlencoded({extended:false}));

console.log(process.env.MYSQLHOST)
const db=mysql.createConnection({
    host:process.env.MYSQLHOST,
    port:process.env.PORT,
    user:process.env.MYSQLUSER,
    password:process.env.MYSQLPASSWORD,
    database:process.env.MYSQLDATABASE,
    ssl: {
    ca: fs.readFileSync(process.env.MYSQLSSLPATH)
  } 
})  
 
let connectionCheck=0;
db.connect((err)=>{
    if(err){ 
        console.log(err);
    }else{ 
        console.log("connected");
        connectionCheck=1;
    }
}) 
 
let tableCreationSignin="CREATE Table usersignup(username varchar(100),email varchar(100) primary key, password varchar(100))";
db.query(tableCreationSignin,(err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("table created")
    }
})
//user personal details
let tableCreationUserData="CREATE Table userpoints(email varchar(100) primary key, points int);"
db.query(tableCreationUserData,(err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("table created")
    }
})


app.use('/signup{.html}',express.static(path.join(__dirname,'public')));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"public","signup.html"));
})

app.use('/signup{.html}',express.static(path.join(__dirname,'public')));
app.post('/',async (req,res)=>{
    const signupInfo=await req.body;
    if(connectionCheck==1){
        let q1=`INSERT INTO usersignup VALUES('${await signupInfo.username}','${await signupInfo.email}','${await signupInfo.password}')`
        db.query(q1,async(err)=>{
            if(err){
                console.error(err.message);
                res.send({
                "status":500,
                "process":"insertion failed"
                });
            }else{
                console.log("Data Insert")
                let q2=`INSERT INTO userpoints VALUES('${await signupInfo.email}',${100})`
                db.query(q2,(err)=>{
                    if(err){
                        console.error(err.message);
                        res.send({
                        "status":500,
                        "process":"insertion failed"
                    });
                }else{
                    res.send({
                    "status":200,
                    "process":"successfull"
                    })
                }
            })
            }
        })
    } 
})

app.use('/login{.html}',express.static(path.join(__dirname,'public')));
app.post('/login{.html}',async(req,res)=>{
    const loginInfo=await req.body;
    let dataFetch=`select * from usersignup where email='${await loginInfo.email}'`;
    db.query(dataFetch,async(err,result)=>{
        if(err){
            console.log(err.message);
        }else{
            if(result.length==1){
                if(result[0].password==loginInfo.password){
                    console.log("welcome");
                    res.send({
                        "statuscode":200,
                        "email":result[0].email,
                        "username":result[0].username,
                        "status":"success"
                    });
                }else{
                    console.log("wrong username or password");
                    res.send({
                        "statuscode":404,
                        "status":"Not found"
                    });
                }
            }else{
                console.log("wrong username or password");
                res.send({
                    "statuscode":404,
                    "status":"Not found"
                });
            }
        }
    })
})

app.use('/login{.html}',express.static(path.join(__dirname,'public')));
app.get('/login{.html}',(req,res)=>{
    res.sendFile(path.join(__dirname,"public","login.html"));
})

app.use('/game{.html}',express.static(path.join(__dirname,'public')));
app.get('/game{.html}',async(req,res)=>{
    res.sendFile(path.join(__dirname,"public","game.html"));
})


app.use('/game{.html}',express.static(path.join(__dirname,'public')));
app.post('/game{.html}',async(req,res)=>{
    q1=`select points from userpoints where email='${await req.body.userN}'`
    db.query(q1,(err,result)=>{
        if(err){
            console.error(err.message);
            res.send({
            "status":500,
            "process":"failed",
            "points":"-1"
            });
        }else{
            res.send({
            "status":200,
            "process":"successfull",
            "points":`${result[0].points}`
            })
        }
    })
})

app.use('/game{.html}',express.static(path.join(__dirname,'public')));
app.put('/game{.html}',async(req,res)=>{
    const points=await req.body;
    q2=`UPDATE userpoints SET points=${points.Points} WHERE email='${points.userN}';`
    db.query(q2,(err)=>{
        if(err){
            console.error(err.message);
            res.send({
            "status":500,
            "process":"failed"
            });
        }else{
            res.send({
            "status":200,
            "process":"successfull"
            })
        }
    })

})


app.listen(PORT,()=>{
    console.log(`port is running on =${PORT}`)
}) 
