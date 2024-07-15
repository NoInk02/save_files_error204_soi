# Library Management System

## Overview

Welcome to our Library Management System (LMS), a comprehensive platform designed to manage books, user accounts, and borrowing activities seamlessly within our institution. Whether you're a student, faculty member, or library administrator of IIT-Dh, our LMS offers a range of features to enhance your library experience.

## File Structure

- `index.js`: Main server file responsible for handling server logic, routing, and database interactions.
- `public/`: Directory containing frontend assets including HTML, CSS and image files for the user interface.
- `LibraryDB.user_otp.json`: JSON file storing OTP data for user registration validation.
- `LibraryDB.users.json`: JSON file storing user profiles and credentials.
- `LibraryDB.book.json`: JSON file storing information about books available in the library.
- `LibraryDB.review.json`: JSON file storing user reviews and ratings for books.
- `report-1.pdf`: Report document providing an overview of the project's design and features.
- `report-2.pdf`: Report document detailing the implementation and technical aspects of the project.
- `report-3.pdf`: Report document covering all the features and future enhancements of the project.
- `package.json`: Node.js package file specifying dependencies and scripts for the project.
- `package-lock.json`: Auto-generated file ensuring deterministic dependency resolution.
- `README.md`: Documentation file providing an overview of the project, installation instructions, and usage details.
  

### Key Features

- **User Registration and Authentication**: New users can register with their credentials, including OTP validation for IITDh email addresses only. User profiles are stored securely in our MongoDB database.

- **Book Search and Browsing**: Easily search and browse books by title, author, or genre. View detailed book information and availability.

- **Borrowing and Returning Books**: Users can borrow books directly from the search results. Borrowed books are displayed in the user's profile with due dates and can be returned with a simple process that includes optional feedback and ratings.

### Additional Features

- **OTP Validation**: Secure registration process with email OTP verification ensuring valid IITDh email addresses only. OTPs are sent using nodemailer with a 5-minute validity period.

- **Unique User Management**: Ensured uniqueness of email addresses and usernames to prevent duplicate profiles.

- **Enhanced Search Experience**: User-friendly search bars with options for partial searches and case insensitivity. Search results display relevant book details with the option to view more.

- **New Arrivals**: Display of the latest books added to the library collection automatically updated on the homepage.

- **Recommendations**: Personalized book recommendations based on title, author, genre, or department, helping users discover relevant books.

- **Feedback and Reviews**: Users can leave feedback and ratings upon returning books, stored in the database under a 'reviews' collection. Reviews help other users make informed borrowing decisions.

- **Due Date Reminders**: Automated email reminders sent to users for overdue books, promoting timely returns.

- **Announcements Section**: Important notifications displayed on the homepage using Bootstrap's scrollspy-container feature.

- **About, Services, and Contact Pages**: Standard pages providing information about the library, its services, and contact details, enhancing user experience and accessibility.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Bootstrap
- nodemailer
- node-cron

## Installation

Ensure you have Node.js and MongoDB installed. Download the zip files,extract them. Import the data LibraryDB.book.json in book collection, LibraryDB.review.json in review collection, LibraryDB.users.json in users collection, LibraryDB.user_otp.json in user_otp collection. If the collections arent present already then create new ones and then import the data there or you can run the `node index.js` command in the terminal which will create these collections and then import the data.

## Getting Started

1. Install dependencies with `npm install`.
2. Import the data from json files into your mongo book collection.
3. Start the server with `npm index.js`.
4. Navigate to `http://localhost:3000` in your browser.

## Team:- 
- Error_204
## Members:-
- Richa Rajashekhar(Team Leader)
- Dev Kaushal



