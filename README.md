# Library Management System

## Overview

Welcome to our Library Management System (LMS), a comprehensive platform designed to manage books, user accounts, and borrowing activities seamlessly within our institution. Whether you're a student, faculty member, or library administrator of IIT-Dh, our LMS offers a range of features to enhance your library experience.

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

Ensure you have Node.js and MongoDB installed. Clone the repository, install dependencies, and set up environment variables.

## Getting Started

1. Install dependencies with `npm install`.
2. Import the data from LibraryDB.book.json into your mongo book collection.
3. Start the server with `npm index.js`.
4. Navigate to `http://localhost:3000` in your browser.



