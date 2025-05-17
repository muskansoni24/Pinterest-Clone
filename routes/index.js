var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const boardModel = require('./boards')
const mongoose = require('mongoose');
const passport = require('passport');
const upload = require('./multer')

//aisa smjh lo in dono line se user login hota hai
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//upload
router.post('/upload', isLoggedIn,  upload.single("file"), async function(req, res, next){
  if(!req.file){
    return res.status(404).send("No files were given");
  }
  // jo file upload hui hai usko save karo as a post and uska postid do user ko, and post ko userid do
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    postText: req.body.filecaption,
    user: user._id
  })

  //give post id to user
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
})

//feed
router.get('/feed', isLoggedIn, async function(req, res, next) {
  try {
    const posts = await postModel.find({}).sort({ createdAt: -1 }); // latest posts first
    
    // Retrieve the user and their boards, default to empty array if not found
    const user = await userModel.findOne({ username: req.session.passport.user }).populate('boards');
    const userBoards = user ? user.boards || [] : []; // Ensure it's an empty array if no boards

    res.render('feed', { posts, userBoards });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading feed.");
  }
});

//save to board
// router.post('/save-to-board', isLoggedIn, async (req, res) => {
//   const { postId, boardId } = req.body;
//   try {
//     const board = await boardModel.findById(boardId);
//     if (!board.posts.includes(postId)) {
//       board.posts.push(postId);
//       await board.save();
//     }
//     res.redirect('/feed'); // or redirect to the board or stay on the same page
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Could not save post to board.");
//   }
// });
//Use AJAX function instead of route, it will save the pin to the board without reloading the feed page
//An AJAX call (Asynchronous JavaScript and XML) is a way to send or receive data from a server in the background without having to reload the entire web page.

router.post('/save-to-board', isLoggedIn, async (req, res) => {
  const { postId, boardId } = req.body;

  try {
    const board = await boardModel.findById(boardId);
    if (!board) return res.json({ success: false, message: 'Board not found' });

    // Avoid duplicate posts in board
    if (!board.posts.includes(postId)) {
      board.posts.push(postId);
      await board.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Server error' });
  }
});

//login
router.get('/login', function(req, res){
  res.render('login', {error: req.flash('error')});
})

//profile
router.get('/profile', isLoggedIn, async function(req, res, next){
  const user = await userModel.findOne({username: req.session.passport.user})
  .populate('posts')
  .populate({
    path: 'boards',
    populate: {path: 'posts'}
  });
  res.render('profile', {user});
});

//register
router.post('/', function(req, res){
  const {username, email, fullname} = req.body;
  const userData = new userModel({username, email, fullname});

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect('/profile');
    })
  })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}), function(req, res){}) ;

router.get('/logout', function(req, res){
  req.logout(function(err){
    if(err) {return next(err)};
    res.redirect('/login');
  })
})

//Boards system -->
router.post('/create-board', isLoggedIn, async (req, res) => {
  const { boardName, boardDescription } = req.body;
  const user = await userModel.findOne({username: req.session.passport.user});

  const board = await boardModel.create({
    boardName,
    boardDescription,
    userId: user._id,
  });

  user.boards.push(board._id);
  await user.save();
  res.redirect('/profile');
});

router.get('/profile/board/:id', isLoggedIn, async function(req, res) {
  try {
    const boardId = req.params.id;

    // Find the board and populate its posts
    const board = await boardModel.findById(boardId).populate('posts');

    if (!board) return res.status(404).send('Board not found');

    res.render('board-view', { board });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading board.");
  }
});

//unsave a post
router.post('/unsave/:pinId', isLoggedIn, async (req, res) => {
  const pinId = req.params.pinId;
  const boardId = req.body.boardId;

  try {
    // Remove the post ID from the board's posts array
    await boardModel.findByIdAndUpdate(boardId, {
      $pull: { posts: pinId }
    });

    // Redirect back to the board page
    res.redirect(`/profile/board/${boardId}`);
  } catch (err) {
    console.error('Error removing post from board:', err);
    res.status(500).send("Something went wrong.");
  }
})

router.post('/edit-profile', isLoggedIn, upload.single('dp'), async (req, res) => {
  try{
    const userId = req.session.passport.user;
    const {username, tagline, description} = req.body;

    const updateData = {
      username,
      tagline,
      description,
    };

    if (req.file) {
      updateData.dp = req.file.filename; 
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    res.redirect('/profile');
  }
  catch(err){
    console.error(err);
    res.status(500).send('Something went wrong !');
  }
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
