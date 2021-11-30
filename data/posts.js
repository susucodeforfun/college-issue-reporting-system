const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
let { ObjectId } = require("mongodb");

// get post by id
async function getPost(postID) {
  if (!postID || !ObjectId.isValid(postID)) {
    throw "Post ID is invalid.";
  }
  // console.log("inside data", postID);
  try {
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: ObjectId(postID) });
    // console.log(post);
    if (!post) {
      throw `Post having ID ${postID} does not exist.`;
    }
    return post;
  } catch (error) {
    throw error.message;
  }
}

// get all posts
async function getAllPosts() {
  try {
    const postCollection = await posts();
    const allPosts = await postCollection.find({}).sort({ date: -1 }).toArray();
    return allPosts;
  } catch (error) {
    throw error.message;
  }
}

//Get users posts
async function getUserPosts(userName) {
  if (!userName) {
    //validates is userName is undefined or not
    throw "Incorrect number of arguments.";
  }
  if (
    !userName ||
    typeof userName != "string" ||
    userName.trim("").length == 0
  ) {
    throw "Username is invalid or empty.";
  }

  try {
    const postCollection = await posts();
    const allPosts = await postCollection
      .find({ username: userName })
      .sort({ date: -1 })
      .toArray();
    return allPosts;
  } catch (error) {
    throw error.message;
  }
}

// create a post
async function addPost(userName, postTitle, postBody, postTags) {
  if (arguments.length != 4) {
    throw "Incorrect number of arguments.";
  }
  if (
    !postTitle ||
    typeof postTitle != "string" ||
    postTitle.trim("").length == 0
  ) {
    throw "Post title is invalid or empty.";
  }
  if (
    !postBody ||
    typeof postBody != "string" ||
    postBody.trim("").length == 0
  ) {
    throw "Post body is invalid or empty.";
  }
  if (
    !userName ||
    typeof userName != "string" ||
    userName.trim("").length == 0
  ) {
    throw "Username is invalid or empty.";
  }

  try {
    const postCollection = await posts();

    let newPost = {
      //Define new post
      title: postTitle,
      body: postBody,
      tags: postTags,
      username: userName,
      resolved: false,
      date: new Date(),
      image: {},
      comments: [],
    };

    const addNewPost = await postCollection.insertOne(newPost);

    if (!addNewPost || addNewPost.insertedCount == 0) {
      //Verify if post was added
      throw "Post was not added.";
    }

    return await this.getPost(addNewPost.insertedId.toString()); //Return newly added post
  } catch (error) {
    throw error.message;
  }
}

//delete a post
async function deletePost(postID) {
  if (!postID || !ObjectId.isValid(postID)) {
    throw "Post ID is invalid.";
  }
  try {
    const postCollection = await posts();
    const postToDelete = await this.getPost(postID); //Get details of post to delete
    const post = await postCollection.removeOne({ _id: ObjectId(postID) });
    if (!post || post.deletedCount == 0) {
      throw `Post with ID ${postID} was not deleted.`;
    }
    return postToDelete;
  } catch (error) {
    throw error.message;
  }
}

// edit a post
async function editPost(postID, postTitle, postBody) {
  // console.log(postID, postTitle);
  if (!postID || !ObjectId.isValid(postID)) {
    throw "Post ID is invalid.";
  }
  if (postTitle && typeof postTitle != "string") {
    throw "Post title should be of type string.";
  }
  if (postBody && typeof postBody != "string") {
    throw "Post body should be of type string.";
  }

  try {
    const postCollection = await posts();

    const oldPost = await postCollection.findOne({ _id: ObjectId(postID) });
    // console.log(oldPost);
    let editedTitle = postTitle ? postTitle : oldPost.title; //Set existing title if not provided
    let editedBody = postBody ? postBody : oldPost.body;
    let date = new Date(); //Set existing body if not provided
    const editedPost = await postCollection.updateOne(
      { _id: ObjectId(postID) },
      { $set: { title: editedTitle, body: editedBody, date: date } }
    );
    if (!editedPost || editedPost.modifiedCount === 0) {
      throw new Error("Failed to edit post.");
    }

    let post = await this.getPost(postID);
    return post;
  } catch (error) {
    throw error.message;
  }
}

// mark post as resolve
async function resolvePost(postID, commentID) {
  if (
    !postID ||
    !ObjectId.isValid(postID) ||
    !commentID ||
    !ObjectId.isValid(commentID)
  ) {
    throw "Post ID is invalid.";
  }
  try {
    const postCollection = await posts();
    const postToResolve = await postCollection.findOne({
      _id: ObjectId(postID),
    });
    let resolveComments = postToResolve.comments.map((e) =>
      e._id.equals(ObjectId(commentID)) ? ((e.answer = true), e) : e
    );
    const post = await postCollection.updateOne(
      { _id: ObjectId(postID) },
      { $set: { resolved: !postToResolve.resolved, comments: resolveComments } }
    );
    if (!post || post.modifiedCount === 0) {
      throw "Error, could not resolve post.";
    }
  } catch (error) {
    throw error.message;
  }
}

// find post by search term
async function findPostsbySearchterm(searchterm) {
  console.log("searchTerm", searchterm);
  if (!searchterm) throw "No Search Term provided";
  const postCollection = await posts();
  var phrase = '"' + searchterm + '"';
  const searchedPosts = await postCollection
    .aggregate([{ $match: { $text: { $search: phrase } } }])
    .toArray();
  console.log(searchedPosts);
  return searchedPosts;
}

module.exports = {
  addPost,
  getUserPosts,
  getAllPosts,
  getPost,
  deletePost,
  editPost,
  findPostsbySearchterm,
  resolvePost,
};