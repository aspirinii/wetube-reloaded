import mongoose from "mongoose";
import bycrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20,
        minLength: 0,
        unique: true,
    },
    email: {
        type: String,
        maxLength: 80,
        minLength: 1,
        trim: true,
        reqiured: true,
        unique: true,
    },
    password: { type: String, trim: true, maxLength: 100, minLength: 0 },
    socialOnly: { type: Boolean, default: false },
    name: { type: String, trim: true, maxLength: 20, minLength: 0 },
    location: { type: String, trim: true, maxLength: 400, minLength: 0 },
    avatarUrl: { type: String },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

// userSchema.pre('save', async function(){
//     console.log( "UserPassword" , this.password);

//     this.password = await bycrypt.hash(this.password, 5 );
//     console.log( "HashedPassword" , this.password);

// });

userSchema.static("hashing", async function (aaa) {
    return await bycrypt.hash(aaa, 5);
});

userSchema.static("compare", async function (aaa, bbb) {
    return await bycrypt.compare(aaa, bbb);
});

const User = mongoose.model("User", userSchema);
export default User;
