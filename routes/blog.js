var express = require("express");
var router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  firebaseApp,
  firebaseStorage,
  db,
  admin,
} = require("../config/firebaseConfig");
const multer = require("multer");
const multerStoreage = multer.memoryStorage();
const upload = multer({ storage: multerStoreage });

//@desc Get All Blogs from firestore and Render the main page
//@route GET /main
//@access private
router.get("/main", async function (req, res) {
  const blogPostsRef = db.collection("blogPosts");
  const query = blogPostsRef.orderBy("createdAt", "desc");
  const resultsPerPage = 1;
  let page = req.query.page || 1;

  let numPages;

  query
    .get()
    .then((snapshot) => {
      const numResults = snapshot.size;
      numPages = Math.ceil(numResults / resultsPerPage);

      // Check if page is out of range
      if (page < 1 || page > numPages) {
        res.redirect("/");
        return;
      }

      // Query for the current page's results
      query
        .limit(resultsPerPage)
        .offset((page - 1) * resultsPerPage)
        .get()
        .then((snapshot) => {
          const blogPosts = [];
          snapshot.forEach((doc) => {
            blogPosts.push({ id: doc.id, ...doc.data() });
          });
          //query for comments of the blog
          db.collection("blogPosts")
            .doc(blogPosts[0].id)
            .collection("comments")
            .orderBy("createdAt", "desc")
            .get()
            .then((snapshot) => {
              blogPosts[0].comments = [];
              snapshot.forEach((doc) => {
                blogPosts[0].comments.push(doc.data());
              });
              // console.log(blogPosts[0].comments);
              return res.render("main", {
                posts: blogPosts,
                page: page,
              });
            });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving blog posts");
    });
});

///@desc Get/Render the create blog form
//@route GET /createpost
//@access private
router.get("/createpost", (req, res) => {
  res.render("createpost", { title: "Create Post" });
});

///@desc Submit and Store Data of created blogs to firestore & firebase
//@route POST /createpost
//@access private
router.post("/createpost", upload.single("image"), async (req, res) => {
  try {
    // Get form data from request body
    const user = req.user;
    let imageUrl;

    const { title, content, subheaders, imageheader } = req.body;

    // Upload image to Firebase Storage
    const storage = firebaseStorage.getStorage(
      firebaseApp,
      "blog-3c055.appspot.com"
    );
    const storageRef = firebaseStorage.ref(
      storage,
      "images/" + req.file.originalname,
      req.file.mimetype
    );
    const metadata = { contentType: req.file.mimetype };
    const uploadTask = firebaseStorage.uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const uploaded = Math.floor(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        console.log(uploaded);
      },
      (error) => {
        console.log(error);
      },
      async () => {
        let imageUrl = await firebaseStorage.getDownloadURL(
          uploadTask.snapshot.ref
        );
        const postRef = db.collection("blogPosts").doc();
        // console.log("postRef=", postRef);
        // console.log("URL3 ", imageUrl);
        const post = {
          title: title,
          content: content,
          subheaders: subheaders.split("\n"),
          imageheader: imageheader,
          imageUrl: imageUrl,
          author: user,
          createdAt: new Date(),
          likes: 0,
        };
        // cconsole.log("URL4 ", imageUrl);
        await postRef.set(post);
        console.log("URL1= ", imageUrl);
        // Redirect to main page
        res.redirect("/main");
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

///@desc Increase Number of Like for a particular blog post
//@route POST /:postId/like
//@access private
router.post("/:postId/like", async (req, res) => {
  console.log("enter like");
  try {
    const { postId } = req.params;
    const blogRef = db.collection("blogPosts").doc(postId);

    // increment the number of likes for the blog post
    await blogRef.update({
      likes: admin.firestore.FieldValue.increment(1),
    });

    // redirect back to the blog post page
    return res.redirect(req.headers.referer || "/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error liking blog post");
  }
});

///@desc Add a comment to a blog post
//@route POST /:postId/comment
//@access private
router.post("/:postId/comment", async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;

  const user = req.user;

  try {
    // Get the blog post document from Firestore
    const postRef = db.collection("blogPosts").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return res.status(404).send("Blog post not found");
    }

    // Add the comment to the comments subcollection
    const commentsRef = postRef.collection("comments");
    const newCommentRef = commentsRef.doc();
    const newComment = {
      comment: comment,
      createdAt: new Date(),
      user: user,
    };
    await newCommentRef.set(newComment);
    // console.log("added comment");

    // Increment the comment count of the blog post
    const commentCount = (postDoc.data().commentCount || 0) + 1;
    await postRef.update({ commentCount: commentCount });

    return res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});
//API For Self Testing Purposes
//@desc Get A Blog Post
//@route GET /:postId
//@access private
router.get("/:postId", async (req, res) => {
  try {
    const blogId = req.params.postId;
    const blogRef = db.collection("blogPosts").doc(blogId);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      // return 404 if blog post does not exist
      return res.status(404).send("Blog post not found");
    }

    // get the number of likes for the blog post
    const likes = blogDoc.data().likes;

    // get the comments for the blog post
    const commentsSnapshot = await blogRef.collection("comments").get();
    const comments = commentsSnapshot.docs.map((doc) => doc.data().comment);

    // render the blog post page with data
    res.render("main", { posts: blogDoc });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting blog post");
  }
});
module.exports = router;
