var mongoose=require('mongoose');
var Schema= mongoose.Schema;

module.exports=mongoose.model('User',new Schema({
	user_email: String,
	user_phoneno: Number,
	password: String,

}));
