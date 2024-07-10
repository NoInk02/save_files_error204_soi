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

const reviewSchema = new mongoose.Schema({
  email: String,
  title: String,
  review: String,
  rating: Number, 
  review_date: Date
});

const Review = mongoose.model("Review", reviewSchema);
const User = mongoose.model("users", userSchema);
const Book = mongoose.model("Book", bookSchema, 'book');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ded66521@gmail.com', 
    pass: 'nbnl xhhx zmqz ymvb'         
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
      await User.deleteOne({ email: email, otp: otp });
      res.send("Registration successful. You can now ");

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
    const existingUser2 = await User.findOne({ email });
    if (existingUser && existingUser2) {
      console.log("Username or email already taken:", username,email); // Debugging log
      return res.status(400).send("Username already taken");
    }

    await newUser.save();
    res.send('Registration successful. You can now login.');
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

// Function to send reminder email
const sendReminderEmail2 = async (user, book) => {
  const mailOptions = {
    from: 'ded66521@gmail.com', // Replace with your email
    to: user.email,
    subject: 'Reminder: Please return overdue book',
    text: `Dear ${user.username},\n\nThis is a reminder that you have not returned the book "${book.title}" which was due on ${user.books_issued.dueDate}.\n\nPlease return the book at your earliest convenience.\n\nThank you.\n\nBest regards,\nLibrary Management System`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email} for book "${book.title}".`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};


// Route for adding books to cart
app.post('/add-to-cart', async (req, res) => {
  const { email, title } = req.body;
  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setMinutes(issueDate.getMinutes() + 10); // Set due date to 10 minutes after issue date

  try {
    const user = await User.findOne({ email });
    if (user) {
      const book = await Book.findOne({ title });
      if (book && book.count > 0) {
        book.count -= 1;
        user.books_issued.push({ title, issue_date: issueDate, due_date: dueDate });

        await book.save();
        await user.save();

        console.log(`Book "${book.title}" added to cart for user ${user.username}.`);
        
        // Schedule email reminder after 10 minutes
        const reminderTime = new Date();
        reminderTime.setMinutes(reminderTime.getMinutes() + 10); // Schedule reminder 10 minutes from now
        const cronString = `${reminderTime.getMinutes()} ${reminderTime.getHours()} * * *`;
        cron.schedule(cronString, async () => {
          try {
            console.log(`Sending reminder email to ${user.email} for book "${book.title}".`);
            await sendReminderEmail2(user, book);
          } catch (error) {
            console.error('Error scheduling reminder email:', error);
          }
        });

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

      // Redirect to review page with book title as a query parameter
      res.json({
        message: 'Book returned successfully. Would you like to write a review?',
        redirectToReview: `/review.html?email=${email}&title=${title}`
      });
    } else {
      res.status(404).json({ message: 'User or book not found.' });
    }
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Route to submit a review with rating
app.post('/submit-review', async (req, res) => {
  const { email, title, review, rating } = req.body;

  const newReview = new Review({
    email,
    title,
    review,
    rating,
    review_date: new Date()
  });

  try {
    await newReview.save();
    res.json({ message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});


app.get('/book-details', async (req, res) => {
  const title = req.query.title;

  try {
    const book = await Book.findOne({ title });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviews = await Review.find({ title });

    // Construct response object with book details and reviews
    const bookDetails = {
      title: book.title,
      description: book.description,
      author: book.author,
      genre: book.genre,
      department: book.department,
      count: book.count,
      vendor: book.vendor,
      vendor_id: book.vendor_id,
      publisher: book.publisher,
      publisher_id: book.publisher_id,
      reviews: reviews // Include reviews in the response
    };

    res.json(bookDetails);
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.post('/recommendations', async (req, res) => {
  const { booksIssued } = req.body;
  console.log('Books issued:', booksIssued); // Debugging log

  try {
    const issuedBooks = await Book.find({ title: { $in: booksIssued.map(book => book.title) } });
    console.log('Issued Books:', issuedBooks); // Debugging log
    const recommendations = new Set();

    await Promise.all(issuedBooks.map(async book => {
      const { author, genre, department } = book;
      const matches = await Book.find({
        $or: [
          { author: author },
          { genre: genre },
          { department: department },
          { title: { $regex: book.title.split(' ').join('|'), $options: 'i' } }
        ],
        title: { $nin: booksIssued.map(book => book.title) }
      }).limit(5 - recommendations.size);

      matches.forEach(match => {
        if (recommendations.size < 5) {
          recommendations.add(match);
        }
      });
    }));

    console.log('Recommendations:', recommendations); // Debugging log
    res.json([...recommendations]);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/profile', async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error querying user data:", error);
    res.status(500).send("Server error");
  }
});

// Route to get the last 5 books (New Arrivals)
app.get('/new-arrivals', async (req, res) => {
  try {
    const books = await Book.find().sort({ _id: -1 }).limit(5); // Sort by _id in descending order and limit to 5
    res.json(books);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).send("Server error");
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});