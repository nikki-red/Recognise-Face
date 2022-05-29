//Set ups
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongo = require('mongodb')
const app = express();
const fs = require('fs');
const multer = require('multer');
require('dotenv/config');
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
const otherPath = path.join(__dirname,'public/js');
app.use(express.static(otherPath));
const folderPath = path.join(__dirname,'public/uploaded_images');
app.use(express.static(folderPath));

//Connecting to database
mongoose.connect('mongodb://localhost:27017/formsDB',{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>{
  console.log("successful connection");
}).catch((err)=>{
  console.log("no connection");
});

//setting multer for storing uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, folderPath)
    },
    filename: (req,file,cb) => {
      cb(null,file.originalname)
    }
});
const upload = multer({ storage: storage });

//loading  the mongoose model for form
const imgModel = require('./model');

//Setting EJS as templating engine
app.set('view engine','ejs');

//GET Handlers
// -> index Page
app.get('/',(req,res) => {
  res.render('index');
});

// -> uploadform Page
app.get('/uploadform', (req, res) => {
	imgModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render('uploadform', { items: items });
		}
	});
});

// -> detect Page
app.get('/detect',(req,res) => {
  let directory = "public/uploaded_images";
  const titles = fs.readdirSync(directory);
  res.render('detect',{titles:titles});
});

// -> display Page
app.get('/display', (req, res) => {
  imgModel.find({}, function(err, forms) {
    res.render('display', { formsList: forms });
  });
});

//POST Handlers
// -> uploadform Page
app.post('/uploadform', upload.single('image'), (req, res, next) => {
	const obj = {
		name: req.body.name,
		id_no: req.body.id_no,
    gender: req.body.gender,
    birthdate: req.body.birthdate,
    nationality: req.body.nationality,
    height: req.body.height,
    weight: req.body.weight,
    mark: req.body.mark,
    img: {
			data: fs.readFileSync(path.join(folderPath + '/'+ req.file.filename)),
			contentType: 'image/jpg'
		}
	};
	imgModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});

app.post('/display',(req, res, next) => {
  var name = req.body.name;
  var id_no = req.body.id_no;
  fs.unlinkSync(folderPath+'/'+name+'.jpg');
  imgModel.deleteOne({ name: name ,id_no: id_no}, (err) => {
    if(err) {
      console.log(err)
    }
    else {
      res.redirect('/display');
    }
  })
})
//Configuring the server's port
app.listen(port, err => {
	if (err) {
		throw err
  }
	console.log('Server listening on port', port)
});
