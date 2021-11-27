const express = require("express");
const router = express.Router();
const postFunctions = require("../data/posts");

//1. Get all posts routes
router.get("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(500).json({ error: "No request body provided!" });
    }
    const posts = await postFunctions.getAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Get posts by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      throw "Post ID not provided for edit!";
    }
    const post = await postFunctions.getPost(id);
    return res.status(200).json(post);
  } catch (error) {
    if (error.message.includes("Post having ID")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 3. Get posts by username
router.get("/userPosts/:username", async (req, res) => {
  const { username } = req.params.username;
  if (!username) {
    return res.status(500).json({ error: "No username parameter!" });
  }
  try {
    const posts = await postFunctions.getUserPosts(username);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. find post by search term
router.post("/search/:searchterm", async (req, res) => {
  const searchTerm = req.params.searchterm;
  if (!req.params.searchterm) {
    return res.status(500).json({ error: "No search term provided" });
  }
  try {
    const posts = await postFunctions.findPostsbySearchterm(searchTerm);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. add post
router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(500).json({ error: "No request body provided!" });
    }
    const newPost = req.body;
    if (
      !newPost.title ||
      typeof newPost.title != "string" ||
      newPost.title.trim("").length == 0
    ) {
      return res.status(400).json({
        error: "Invalid post title, cannot be empty, type should be string.",
      });
    }
    if (
      !newPost.body ||
      typeof newPost.body != "string" ||
      newPost.body.trim("").length == 0
    ) {
      return res.status(400).json({
        error: "Invalid post body, cannot be empty, type should be string.",
      });
    }
    if (
      !newPost.username ||
      typeof newPost.username != "string" ||
      newPost.username.trim("").length == 0
    ) {
      return res.status(400).json({
        error: "Invalid username, cannot be empty, type should be string.",
      });
    }

    // call the addPost functions from the data
    const addPost = await postFunctions.addPost(
      newPost.username,
      newPost.title,
      newPost.body,
      newPost.tags,
      new Date()
    );
    return res.status(200).json(addPost);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. editing a post
router.patch("/edit/:id", async (req, res) => {
  try {
    if (!req.params || !req.params.id) {
      throw "Post ID not provided for edit!";
    }
    if (!req.body) {
      throw "No request body provided!";
    }
    if (req.body.postTitle && typeof req.body.postTitle != "string") {
      return res.status(400).json({
        error: "Invalid post title, cannot be empty, type should be string.",
      });
    }
    if (req.body.postBody && typeof req.body.postBody != "string") {
      return res.status(400).json({
        error: "Invalid post body, cannot be empty, type should be string.",
      });
    }
    await postFunctions.getPost(req.params.id);
    const editedPost = await postFunctions.editPost(
      req.params.id,
      req.body.postTitle,
      req.body.postBody
    );
    return res.status(200).json(editedPost);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. adding a comment
router.patch("/comments/:id", async (req, res) => {
  try {
    if (!req.params || !req.params.id) {
      throw "Post ID not provided for resolve!";
    }
    if (!req.body) {
      throw "No request body provided!";
    }
    const newComment = req.body;
    if (!newComment.username && typeof newComment.body != "string") {
      return res.status(400).json({
        error: "Invalid post title, cannot be empty, type should be string.",
      });
    }

    const comment = await postFunctions.addComment(
      objectId(newComment._id),
      newComment.userID,
      req.params.id,
      newComment.username,
      newComment.body
    );
    return res.status(200).json(comment);
  } catch (error) {
    if (error.message.includes("Post having ID")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 8. resolving a post
router.patch("/resolve/:id/:cid", async (req, res) => {
  try {
    if (!req.params || !req.params.id || !req.params.cid) {
      throw "Post ID not provided for resolve!";
    }
    await postFunctions.getPost(req.params.id);
    const resolvePost = await postFunctions.resolvePost(
      req.params.id,
      req.params.cid
    );
    return res.status(200).json(resolvePost);
  } catch (error) {
    if (error.message.includes("Post having ID")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 9. deleting a post
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!req.params || !req.params.id) {
      throw "Post ID not provided for resolve!";
    }

    const checkIfPostExists = await postFunctions.getPost(req.params.id);

    await postFunctions.deletePost(req.params.id);
    return res.status(200).json(checkIfPostExists);
  } catch (error) {
    if (error.message.includes("Post having ID")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
