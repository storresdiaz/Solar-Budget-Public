const express = require("express")
const cors = require("cors")
const mongodb = require("mongodb").MongoClient
const multer = require("multer")
const upload = multer({ dest: 'uploads/' })
const cookieParser = require("cookie-parser")
const crypto = require("crypto")
const app = express()
//const port = 3000
const port = process.env.PORT
var cookie = require("cookie")
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "eeeeeee@eeeeee.com", 
    pass: "eeeeeeeeeee",
  },
});
     

app.use('/webhook', express.raw({type: "*/*"}))
app.use(express.static(__dirname+"/public"))
app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(cookieParser({secret: "eeeeeeeeeeeeeeeeeeeeee"}))
app.use(cors())


/* Connect to database */
const databaseURI = "mongodb+srv://torrezsae:Pork2mes!@cluster0.l4l1b.mongodb.net/Cluster0?retryWrites=true&w=majority"
const client = new mongodb(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true })
const database = client.db("Cluster0")

connectDatabase()
function connectDatabase(){
    client.connect()
    console.log("Connected to database.") 

}
//--------------------------------------------------------

/* Encryption / Decryption Methods */
async function encryptText(textToEncrypt){

  return new Promise((resolve, reject)=>{
    crypto.scrypt(password, salt, 24, function(error, key){
    if(error) reject(error)
      let iv = crypto.randomBytes(8).toString("hex")
      let cipher = crypto.createCipheriv(algorithm, key, iv)
      let encryptedText = cipher.update(textToEncrypt, "utf-8", "hex")
      encryptedText += cipher.final("hex")
      encryptedText += iv
      resolve(encryptedText)
  })
})
}

async function decryptText(textToDecrypt){

  return new Promise((resolve, reject)=>{
    let iv = extractSuffixBytes(16, textToDecrypt)
    textToDecrypt = removeIVSuffix(16, textToDecrypt)
    crypto.scrypt(password, salt, 24, function(error, key){
      if(error) reject(error)
      let decipher = crypto.createDecipheriv(algorithm, key, iv)
      let decryptedText = decipher.update(textToDecrypt, "hex", "utf-8")
        decryptedText += decipher.final("utf-8")
        resolve(decryptedText)
    })
  })

    function extractSuffixBytes(numberOfBytes, textToExtractFrom){
      let bytes = Array.from(textToExtractFrom)   
      let byteStack = []
      let byteString = ""
          for(let i = bytes.length-1; i >= bytes.length-numberOfBytes; i--){
            byteStack.push(bytes[i])
          }
          for(let i = byteStack.length-1; i >= 0; i--){
            byteString += byteStack[i]
          }
          return byteString
    }

    function removeIVSuffix(ivLength, textToRemoveIV){
      let bytes = Array.from(textToRemoveIV)
      let byteString = ""
        for(let i = 0; i < bytes.length - ivLength; i++){
          byteString += bytes[i]
        }
        return byteString
    }    
}
//--------------------------------------------------------------------------------

/* Function for comparing sessionID cookie data to database */
async function getUserBySessionID(sessionID){
  let db = client.db("Cluster0")
  return new Promise((resolve, reject)=>{
    db.collection("users").findOne({sessionID: sessionID}, function(error, result){
        if(error || result == null){
          reject(error)
        }
        else{
          resolve(result)
        }
    })
  })
}
//----------------------------------------------------------------

app.get('/', (req, res) => {
  let sessionID = req?.cookies.sessionID

  getUserBySessionID(sessionID).then(()=>{
    res.sendFile(__dirname+"/public/appmain.html")
  }).catch((err)=>{
    res.sendFile(__dirname+"/public/loginpage.html")
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.put('/put-CreateAccount', upload.none(), (req, res) => {
  let email = req?.body?.email
  let password = req?.body?.password
  let passwordConfirm = req?.body?.passwordConfirm
  let document = {}

      function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

    

      if(validateEmail(email)){

        findUserByEmail()

        async function findUserByEmail(){
          await encryptText(password).then((resolved)=>{
            document = {email : email, password : resolved}
          })

          
          let date = new Date()
              date.setDate(date.getDate()+31)
          let membershipExpiration = {day : date.getDate(), month: date.getMonth(), year: date.getFullYear()}
              document.membershipExpiration = membershipExpiration
      
          if(password == passwordConfirm){
                database.collection("users").findOne({email: email}, (error, result)=>{
                  if(error){
                    console.log(error)
                    res.send(400)
                  }
                  else if(email == result?.email){
                    res.send("exists") // Email already in system
                  }
                  else{
                    database.collection("users").insertOne(document).then(()=>{
                        res.send(200)
                    }).catch((error)=>{
                      console.log(error)
                    })
                  }
                })
              }else{
                res.send("mismatch")
              } 
          }

      }
      else{
        res.send("invalid-email")
      }
})

app.put("/requestResetCode", upload.none(), (req, res)=>{
    let email =  req?.body?.email

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

      let code = ''
      for(let i = 0; i < 6; i++){
        let number = getRandomInt(10)
          code = code + ''+number
      }
      code = parseInt(code)

      database.collection('users').findOneAndUpdate({email: email}, {$set:{resetCode: code}}).then(()=>{

      
        transporter.sendMail({
          from: '"Solar Budget" <support@solarbudget.org>', 
          to: email, 
          subject: "Your Password Reset Code", 
          text: "Your password reset code is : "+code 
        }).then(()=>{
          res.json({status: 'done', email : email})
        }).catch(()=>{res.json({status: "failed"})})
     

        
      }).catch((err)=>{
        console.log(err)
        res.json({status: 'done', email: email})
      })
  
})

app.put('/validateResetCode', upload.none(), (req, res)=>{
    let code = req?.body?.code
    let email = req?.body?.email
    let resetAttempts = 0

    database.collection("users").findOne({email: email}).then((resolve)=>{
        if(resolve.resetCode == code){
          database.collection("users").findOneAndUpdate({email: email}, {$set:{resetAttempts: 0, isResetable: true}}).then((resolve)=>{
            res.json({status: 'done', code: code, email: email, attempts: resetAttempts})
          }).catch((err)=>{
            console.log(err)
            res.json({status: 'failed', code: code, email: email, attempts: resetAttempts})
          })
        }
        else{
              resetAttempts = parseInt(resolve.resetAttempts) || 0
              resetAttempts += 1
          
          if(resetAttempts > 3){
            database.collection("users").findOneAndUpdate({email: email}, {$set:{locked: true, resetAttempts:0}}).then((resolve)=>{
              res.json({status: 'locked', code: code, email: email, attempts: resetAttempts})
            }).catch((err)=>{
              res.json({status: 'failed', code: code, email: email, attempts: resetAttempts})
              console.log(err)
            })
          }

          else{
          database.collection("users").findOneAndUpdate({email: email}, {$set:{resetAttempts: resetAttempts}}).then((resolve)=>{
            res.json({status: 'incorrect', code: code, email: email, attempts: resetAttempts})
          }).catch((err)=>{
            res.json({status: 'failed', code: code, email: email, attempts: resetAttempts})
            console.log(err)
          })

          }

        }
    }).catch((err)=>{
      console.log(err)
      res.json({status:'failed', code: code, email: email})
    })
})

app.put('/requestPasswordReset', upload.none(), (req, res)=>{
    let password = req?.body?.password
    let passwordConfirm = req?.body?.passwordConfirm
    let email = req?.body?.email
    let code = req?.body?.code

    database.collection("users").findOne({email: email}).then((response)=>{
      if(response.resetCode == code && password == passwordConfirm && response.isResetable){
        encryptText(password).then((encryption)=>{
          database.collection("users").findOneAndUpdate({email: email}, {$set:{password: encryption, isResetable: false, resetAttempts: 0}}).then(()=>{
            res.json({status: 'done'})
          }).catch(()=>{res.json({status: 'failed'})})
        }).catch((reject)=>{
          console.log(reject)
          res.json({status: 'failed'})
        })
      }else{
        res.json({status: 'mismatch'})
      }
    }).catch((reject)=>{
      console.log(reject)
      res.json({status: 'failed'})
    })

})

  app.put("/put-Login", upload.none(), (req, res)=>{
    let email = req?.body?.email
    let password = req?.body?.password
    let decryptedPassword = ""
    let document = {email: email, password: password}
  
    login()
    async function login(){
  
      await new Promise((resolve, reject)=>{
          database.collection("users").findOne({email: email}, {}, (error, result)=>{
            if(error || result == null){
              reject(error)
            } 
              else if(result){
                decryptText(result.password).then((decryption)=>{
                  decryptedPassword = decryption
                    if(result.email == email && decryptedPassword == password){
                      
                      let initialID = crypto.randomBytes(256).toString("hex")
                      checkIfUnique(initialID)
                      function checkIfUnique(value){
                        let foundMatch = false
                        let id = value
                        let documents =  database.collection('users').find({})
                            documents.forEach(function(doc){
                              if(doc.sessionID === id){
                                id = crypto.randomBytes(256).toString("hex")
                                foundMatch = true
                                checkIfUnique(id)
                              }
                            }).then(()=>{
                              if(foundMatch == false){
                                res.setHeader("Set-Cookie", cookie.serialize("sessionID", id, {
                                  httpOnly: true,
                                  maxAge: 60*60*24*7
                                }))

                                let date = new Date()
                                let lastLogin = {day: date.getDate(), month: date.getMonth(), year: date.getFullYear()}

                                result.lastLogin = lastLogin
                                result.sessionID = id
                                result.isResetable = false
                                result.resetAttempts = 0
                                database.collection("users").replaceOne({email: email}, result)
                                resolve("success")
                              } 
                            }).catch((err)=>{
                              reject("incorrect")
                              console.log(err)
                            })
                        }                    
                    }
                    else{
                      reject("incorrect")
                    }
                })
            }
          })
      }).then((resolve)=>{
        res.send(resolve)
      }).catch((reject)=>{
        console.log(reject)
        res.send(reject)
      })
      
    }
  
  })

  app.get("/logout", (req, res)=>{
    let sessionID = req?.cookies?.sessionID
    database.collection('users').findOneAndUpdate({sessionID: sessionID}, { $unset: {sessionID: ''}}).then(()=>{
      res.send('done')
    }).catch((err)=>{
      console.log(err)
      res.send('error')
    })
  })

  app.put("/put-Ticket", upload.none(), (req, res)=>{
    let email = req?.body?.email
    let subject = req?.body?.subject
    let message = req?.body?.message

    database.collection('tickets').insertOne({email: email, subject: subject, message: message}).then(()=>{
      res.send('success')
    }).catch((err)=>{
      console.log(err)
      res.send('error')
    })
  })

  app.get("/get-UserSoftInfo", (req, res)=>{
    let sessionID = req?.cookies?.sessionID

    if(sessionID){
      getUserBySessionID(sessionID).then((resolve)=>{
        let user = resolve
        user.email = "null"
        user.password = "null"

        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()

       
        try{
          if(user.membershipExpiration.year > year){
            user.membershipStatus = 'active'
          }
          else if(user.membershipExpiration.month > month){
            user.membershipStatus = 'active'
          }
          else if(user.membershipExpiration.day >= day){
            user.membershipStatus = 'active'
          } 
          else{
            user.membershipStatus = 'inactive'
          }
        }catch(e){
          user.membershipStatus = 'inactive'
        }

        res.json(user)
      }).catch((err)=>{
        res.json({status: 'no-login'})
      })
    }else{
      res.json({status: 'no-login'})
    }

  })

  app.post("/post-UserFinances", (req, res)=>{
    let sessionID = req?.cookies?.sessionID
    let expenses = req?.body[0]?.expenses
    let incomes = req?.body[0]?.incomes
    let debts = req?.body[0]?.debts
    let annualExpenses = req?.body[0]?.annualExpenses
    let funds = req?.body[0]?.funds
    let isFirstLogin = req?.body[0]?.isFirstLogin
    
    getUserBySessionID(sessionID).then((user)=>{

      database.collection("users").findOneAndUpdate({email: user.email}, {$set:{expenses: expenses, incomes: incomes, debts: debts, annualExpenses: annualExpenses, isFirstLogin: isFirstLogin, funds:funds}}).then(()=>{
        res.send("uploaded")
      }).catch((err)=>{
        console.log(err)
        res.send('error')
      })

    }).catch((err)=>{
      console.log(err)
      res.send('error')
    })
  })

  /* Stripe */
  const endpointSecret = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

  app.get("/create-payment-intent", async (req, res)=> {
    let sessionID = req?.cookies?.sessionID
  
    const user = await getUserBySessionID(sessionID)
  
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999,
      currency: "usd",
      metadata: {email: user.email},
      receipt_email: user.email
      })

    res.json({clientSecret: paymentIntent.client_secret, status: 'success'})

  })
  

  app.post('/webhook/payment-success', (req, res)=>{
    const sig = req.headers['stripe-signature']
    let event;
    
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      } catch (err) {
        console.log(err)
        res.status(400).send(`Webhook Error: ${err.message}`)
        return;
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object
          let email = paymentIntent.metadata.email
                
                    let date = new Date()
                        date.setDate(date.getDate()+366)
                    if(month > 11){
                      month = 0
                    }
                    let membershipExpiration = {day : date.getDate(), month: date.getMonth, year: date.getFullYear()}
                    database.collection('users').findOneAndUpdate({email: email}, {$set:{membershipExpiration: membershipExpiration}}).then(()=>{
                      database.collection('users').findOneAndUpdate({email: email}, {$push:{paymentReceipts: paymentIntent.id}}).then(()=>{

                      }).catch((err)=>{
                        console.log(err)
                      })
                    }).catch((err)=>{
                      console.log(err)
                    })   
             break;   
         
       
        default:
         // console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.send(200);
  })

   
