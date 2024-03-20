const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,

    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: "/images/default.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    }
}, { timestamps: true })

userSchema.pre('save', function (next) {
    const user = this
    if (!user.isModified("password")) return;
    // salt is a secret key using which data is hashed
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

// Virtual function to find the match the user by email and password(we will generate password from the given salt of user and then if it mathces with user password then signin )
userSchema.static("matchPassword", async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const passwordForVerify = createHmac('sha256', salt).update(password).digest("hex");

    if (passwordForVerify !== hashedPassword) throw new Error("Incorrect Passwords");

    //creates and returns the token for authentication
    const token = createTokenForUser(user);
    return token;
})

const User = model('user', userSchema)

module.exports = User; 