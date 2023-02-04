const express=require('express')
const cors=require('cors')
const app=express();
const path=require('path')
const multer=require('multer') 
const mysql=require('mysql')
const { diskStorage}=require('multer')
const dotenv=require('dotenv')
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
})


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
 


app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/myapp.html')
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
        }
      );
      
      connection.query(`SELECT * FROM credentials WHERE username = ? AND password =? `,[username,password],async(err,result)=>{
        if(err) console.log("err found");
       
            // image=path.join("images",result[0].image.toString())
          image = path.join(__dirname + 'images',result[0].image)
        //   console.log(image);
        //   res.sendFile(__dirname + '/myapp.html')

        res.json({image:image,uname:username,email:email})
        
      })

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


app.put('/update/:id',(req,res)=>{
    console.log(req.body);
   let id=req.params.id
   let password=req.body.password;
   let username=req.body.name
   let email=req.body.email
   


    connection.query(`UPDATE credentials SET password= ?,email= ? WHERE id= ?`,[password,email,id],(err,result)=>{
        if(err) {console.log(err);
    }
    else{
     if(result.affectedRows==0){
        res.send("Id not present")
     }
     else{
        res.send("updated")
     }
    }
    })
})
const port=process.env.PORT || 3500
app.listen(3500,()=>{
    console.log(`the app is running `);
})
