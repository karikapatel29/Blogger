const { Router } = require("express");
const Blog = require("../models/blog");
const multer = require("multer");
const path = require("path");
const Comment = require("../models/comments");


const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
})

const upload = multer({ storage: storage })

// we also send user object along with addBlog page
router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user
    })
})

router.post("/", upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageUrl: `/uploads/${req.file.filename}`
    })
    return res.redirect(`/blog/${blog._id}`);

})

router.get("/:id", async (req, res) => {
    //to get the user who created the blog, we use populate on createdBy as in models we said ref:user
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    //to get the user who commented the blog, we use populate on createdBy as in models we said ref:user
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy')

    return res.render('blog', {
        user: req.user,
        blog,
        comments
    })
})

router.post("/comment/:blogId", async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    });
    return res.redirect((`/blog/${req.params.blogId}`))
})

module.exports = router;