var express=require('express');
var app=express();
var bodyparser=require('body-parser');
var morgan=require('morgan');
var mongoose=require('mongoose');
var jwt=require('jsonwebtoken');
var User=require('./models/user');
 var config=require('./config');
// var session=require('express-session');
var port=5677;

var cookieparser = require('cookie-parser');
var session = require('express-session');

var router=express.Router();
mongoose.connect(config.database);
app.set('superSecret',config.secret);
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json());
//session management

app.use(cookieparser());
app.use(session({
  secret:'hjkgbjkskkjhs',
  saveUninitialized: false,
  resave: false
}));
app.use(morgan('dev'));

app.get('/',function(req,res){
	res.send('everything ok');

});

router.post('/register', function(req, res){
	var nick=new User({
		user_email:req.body.user_email,
		user_phoneno:req.body.user_phoneno,
		password:req.body.password
	});
	nick.save(function(err){
		if(err) throw err;
		 console.log('user saved');
		 res.json({success:true});
	});
		User.findOne({}, function(err,user){

					var token=jwt.sign(user,app.get('superSecret'),{
						expiresIn:60*60*24
				});
					res.json({
						success: true,
						message:'token creeated',
						token:token
					});
				})			

});
router.use(function(req,res,next){
	var token=req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token,app.get('superSecret'), function(err,decoded){
			if(err){
				return res.json({success:false, message:'failed to authendicate the tokens'});

			}else{
				req.decoded=decoded;
				next();
			}
		});
	}else{
		return res.status(404).send({
			success:false,
			message:'no token provided'
		});
	}
});

router.get('/users', function(req,res){
	User.find({}, function(err, users){
		res.json(users);
	});
});


router.post('/authenticate', function(req, res){
	User.findOne({ $or:[
		{user_email:req.body.user_email
	},{user_phoneno:req.body.user_phoneno}]},function(err, user)
		{
			if(err) throw err;
			if(!user){
				res.json({success:false,message:'aurthendication failes'});

			} 

			else if(user)
			{
				if(user.password!=req.body.password){
					res.json({success: false, message:'authendication failed'});

				}
				else
				{
					res.json({success:true,message:'login success'});
				}
		}
	});	
});
app.use('/api',router);
app.listen(port);


