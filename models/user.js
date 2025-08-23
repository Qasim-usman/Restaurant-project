const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

const User = mongoose.model('User', userSchema);
module.exports = User;
