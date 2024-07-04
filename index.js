const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cron = require('node-cron');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/LibraryDB";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Mongoose schemas and models
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  favourite_book: String,
  favourite_author: String,
  otp: String,
  otpExpires: Date,
  books_issued: [{
    title: String,
    issue_date: Date,
    due_date: Date
  }]
});

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  genre: String,
  department: String,
  count: Number,
  vendor: String,
  vendor_id: Number,
  publisher: String,
  publisher_id: Number
});

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema, 'book');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ded66521@gmail.com', // Replace with your email
    pass: 'nbnl xhhx zmqz ymvb'         // Replace with your email password
  }
});

// Function to send OTP email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: 'ded66521@gmail.com', // Replace with your email
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP is ${otp} new code`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve register.html
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Route to send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Set OTP expiration time (5 minutes from now)
  const otpExpires = Date.now() + 5 * 60 * 1000;

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      const newUser = new User({ email, otp, otpExpires });
      await newUser.save();
    }
    sendOtpEmail(email, otp);
    res.send("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send("Server error");
  }
});

// Route to verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp, username, password, favourite_book, favourite_author } = req.body;

  try {
    const user = await User.findOne({ email, otp });
    if (user && user.otpExpires > Date.now()) {
      // OTP is valid, proceed with registration
      user.username = username;
      user.password = password;
      user.favourite_book = favourite_book;
      user.favourite_author = favourite_author;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      res.send("Registration successful. You can now <a href='/'>login</a>.");
    } else {
      res.status(400).send("Invalid or expired OTP");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send("Server error");
  }
});

// Route for user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", email, password);

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      const encodedBooksIssued = encodeURIComponent(JSON.stringify(user.books_issued));
      res.redirect(`/profile.html?username=${user.username}&email=${user.email}&fav_author=${user.favourite_author}&fav_book=${user.favourite_book}&books_issued=${encodedBooksIssued}`);
    } else {
      res.send("Invalid credentials. Please try again.");
    }
  } catch (error) {
    console.error("Error querying user data:", error);
    res.status(500).send("Server error");
  }
});

// Route for user registration
app.post("/register", async (req, res) => {
  const { username, email, password, favourite_book, favourite_author } = req.body;

  // Check if the email is of the required format
  const emailRegex =  /^[a-zA-Z0-9._%+-]+@iitdh\.ac\.in$/;
  const isEmailValid = emailRegex.test(email);

  console.log("Email validation result:", isEmailValid); // Debugging log
  if (!isEmailValid) {
    console.log("Invalid email format:", email); // Debugging log
    return res.status(400).send('Email ID type not valid. Please use an IITDH email ID to <a href="/register">register</a>.');
  }

  const newUser = new User({
    username,
    email,
    password,
    favourite_book,
    favourite_author,
    books_issued: []
  });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already taken:", username); // Debugging log
      return res.status(400).send("Username already taken");
    }

    await newUser.save();
    res.send('Registration successful. You can now <a href="/">login</a>.');
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).send("Server error");
  }
});

// Route for searching books
app.get('/search', async (req, res) => {
  const title = req.query.title;
  console.log(`Searching for book title containing: ${title}`);
  
  try {
    const regex = new RegExp(title, 'i'); // Create a regex object
    const bookMatches = await Book.find({ title: { $regex: regex } });
    console.log(bookMatches);
    if (bookMatches.length > 0) {
      res.json(bookMatches);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    console.error("Error searching for books:", error);
    res.status(500).send("Server error");
  }
});

// Route for adding books to cart
app.post('/add-to-cart', async (req, res) => {
  const { email, title } = req.body;
  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(issueDate.getDate() + 1); // Set due date to 1 days after issue date

  try {
    const user = await User.findOne({ email });
    if (user) {
      const book = await Book.findOne({ title });
      if (book && book.count > 0) {
        book.count -= 1;
        user.books_issued.push({ title, issue_date: issueDate, due_date: dueDate });

        await book.save();
        await user.save();

        res.send("Book added to cart and count updated successfully.");
      } else {
        res.status(404).send("Book not found or out of stock");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user or book data:", error);
    res.status(500).send("Server error");
  }
});

// Route for returning books
app.post('/return-book', async (req, res) => {
  const { email, title } = req.body;

  try {
    const user = await User.findOne({ email });
    const book = await Book.findOne({ title });

    if (user && book) {
      user.books_issued = user.books_issued.filter(b => b.title !== title);
      book.count += 1;

      await user.save();
      await book.save();

      res.json({ message: 'Book returned successfully.' });
    } else {
      res.status(404).json({ message: 'User or book not found.' });
    }
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route for recommendations
app.post('/recommendations', async (req, res) => {
  const { booksIssued } = req.body;

  try {
    const genres = await Book.distinct('genre');
    const recommendations = [];

    for (const genre of genres) {
      const genreBooks = await Book.find({ genre }).limit(5).exec();
      recommendations.push(...genreBooks);
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Cron job to check for overdue books every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running a task every day at midnight to check for overdue books');
  
  const now = new Date();
  try {
    const users = await User.find({ 'books_issued.due_date': { $lt: now } });
    for (const user of users) {
      user.books_issued.forEach(book => {
        if (book.due_date < now) {
          console.log(`Book titled "${book.title}" is overdue for user ${user.email}`);
        }
      });
    }
  } catch (error) {
    console.error('Error checking overdue books:', error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
