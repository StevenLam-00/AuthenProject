const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT

});

exports.register = (req,res) => {
    console.log(req.body); //grab data from the form and show in terminals

    // const name = req.body.name;
    // const email= req.body.email;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;


    const {name, email, password, passwordConfirm} = req.body //same as block of code above




    db.query('SELECT email FROM users WHERE email =?', [email], async(error, results)=>{
        if(error){
            console.log(error);
        }
        if(results.length> 0){
            return res.render('register',{
                message: "That email is already in use"
            });
        }
        else if(password != passwordConfirm){
            return res.render('register',{
                message: "Password do not match"
            });
        }
        
    //Hash Password by BcryptJS
    let hashedPassword = await bcrypt.hash(password,8); // these password of encrypting could take 
                                                    // a few seconds more than the code is actually run 
                                                    // => Need to put "async" in function of querying db
                                                    // -- HASH FOR 8 ROUNDS/TIMES --
    console.log(hashedPassword);

    



    db.query('INSERT INTO users SET ?',{
        name: name, 
        email: email,
        password: hashedPassword},  (error, results)=>{
        if(error){
            console.log(error);
        }else{
            console.log(results);
            return res.render('register',{
                message: "User Registered Successfully"
            }); 
        }
    });

    });
}

exports.login = (req, res) => {
    try{
        const{email, password} = req.body;

        //If submit without email and password
        if( !email || !password){
            return res.status(400).render('login',{message: 'Please enter your email and password'});
        }


        db.query('SELECT * FROM users WHERE email=?', [email], async(error, results)=>{
            console.log(results);

            //WRONG PASS or NO RESULTS
            if ( !results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login',{
                    message: 'Wrong email or password'
                })
            }else{
                const id = results[0].id;
                const token = jwt.sign({id}, process.env.JWT_SECRT,{
                    //When this token expired
                    expireIn: process.env.JWT_EXPIRES_IN
                });

                //create token
                console.log("The token is: "+ token);
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //convert to milliseconds
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");

            }
        })

    }catch(error){
        console.log(error);
    }
}