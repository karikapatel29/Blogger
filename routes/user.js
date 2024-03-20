const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog")
const Comment = require("../models/comments")
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/images/`));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
})

const upload = multer({ storage: storage })

router.get('/signin', (req, res) => {
    return res.render("signin");
})

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPassword(email, password);
        const user = await User.findOne({ email: email })
        return res.cookie("token", token).cookie("user_id", user._id).redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password"
        });
    }
})

router.get('/signup', (req, res) => {
    return res.render("signup");
})

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({
        fullName,
        email,
        password
    });

    return res.redirect("/")
})

router.post("/edit-profile", upload.single('profileImageUrl'), async (req, res) => {

    // Delete functionality
    if (!req.body.email && !req.body.fullName) {

        id = req.cookies.user_id
        await User.findByIdAndDelete(id)
        await Blog.findOneAndDelete({ createdBy: id });
        await Comment.findOneAndDelete({ createdBy: id });
        return res.clearCookie('token', 'user_id').redirect("/")
    }

    // Update functionality

    const { fullName, email } = req.body
    // console.log(req.user.fullName)

    await User.findOneAndUpdate({ fullName: req.user.fullName }, {
        fullName: fullName,
        email: email,
        profileImageUrl: `/images/${req.file.filename}`
    })
    return res.redirect("/");

})

router.get("/editprofile", (req, res) => {

    return res.render("editprofile", { user: req.user });
})

router.get("/logout", (req, res) => {
    return res.clearCookie('token').redirect("/")
})

module.exports = router;