const express=require('express')
const app=express();
const path=require('path')
const multer=require('multer') 
const mysql=require('mysql')
const { diskStorage}=require('multer')
const dotenv=require('dotenv');
;
dotenv.config();

    const connection=mysql.createConnection({
        host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
    port:process.env.DB_PORT
});
connection.connect((err)=>{
    if(err){
        console.log(err.message);
    }
    console.log('db '+ connection.state);
});


const storage=diskStorage({
    destination:function(req,file,cb){
        cb(null,"images")
    },
    filename:function(req,file,cb){
        cb(null,`${file.originalname}`);
    }
})
const upload=multer({storage});
dotenv.config()

 app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,"images")))
 

app.set('view engine','ejs')



app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/myapp.html')
  
})
app.get('/login',(req,res)=>{
    res.sendFile("./loggedin.html",{root:__dirname})
})

let image;
app.post('/add-data',upload.single('image'),(req,res)=>{
    
    console.log(req.body);

    let password=req.body.password;
    let username=req.body.name
    let email=req.body.email
    image=req.file.filename
    console.log(image);
    
    connection.query(
        `INSERT INTO credentials (username,password,email,image) VALUES (?,?,?,?)`,
        [username,password,email,image],
        (err, result) => {
          if (err) console.log("err found:", err);
        //   res.send("data saved in database successfully")
          console.log("data entered successfully!");
          res.redirect('/login')
        }
      );
})
app.get('/login',(req,res)=>{
    res.sendFile("./loggedin.html",{root:__dirname})
})

app.post('/login',(req,res)=>{

    let password=req.body.password;
    let username=req.body.name
    
 let query=`SELECT * FROM credentials WHERE username= ? AND password=?`
    connection.query(query,[username,password],(err,result)=>{
        if(err)throw err
        else if(result.length>0){
            for(let i=0;i<result.length;i++){
            if(result[i].username==username && result[i].password==password){
                res.redirect('/update')
            
            }
        }
        }
        else{
            res.send("sorry")
        }

    })
})

app.get('/update',(req,res)=>{
    res.sendFile(path.join(__dirname,"./update.html"))
})
app.post('/update',(req,res)=>{
    let password=req.body.password;
    let username=req.body.name
    let email=req.body.email
    connection.query(`UPDATE credentials SET username=${username} ,password=${password} ,email=${email}`)
})


app.delete('/delete/:id',(req,res)=>{
  
    let delid=req.params.id
    const query=`DELETE FROM credentials where id=?`;
    connection.query(query,delid,(err,result)=>{
        if(err) console.log(err);
        else{
            if(result.affectedRows==0){
               res.send("Id not present")
            }
            else{
               res.send("deleted")
               console.log(result);
            }
           }

    })

})


const port=process.env.PORT || 3500
app.listen(3500,()=>{
    console.log(`the app is running `);
})
