var mongoose = require('mongoose');
var formSchema = new mongoose.Schema({
  name: {
      type:String,
      required:true
    },
    id_no: {
      type:String,
      required:true,
      unique:true
    },
    gender: {
      type:String,
      required:true
    },
    birthdate: {
      type:String,
      required:true
    },
    nationality:{
      type:String
    },
    height: {
      type:Number
    },
    weight: {
      type:Number
    },
    identification: {
      type:String
    },
    img:{
        data: Buffer,
        contentType: String
    }
});

//Form model having schema formSchema
module.exports = new mongoose.model('Form', formSchema);
