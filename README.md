# DevShelf- Error_204

- All files are to be downloaded as they are uploaded in the repo. 
- Public folder contains all the html and css files.
- config contains db.js which connects to the mongodb database management system
- models contain java script for storing data
- UpdatedDatasetSOI.json contains the dataset that was provided
- index.js contains most of our backend
- node_modules directory has not been uploaded as it was very big folder
  
Rough structure should be something like this:
```
project-root/
│
├── node_modules/
│
│── config/
│   └── db.js
|
│── models/
|   ├── user.js
│   └── book.js
│
├── public/
│   ├── index.html
│   ├── register.html
│   ├── profile.html
│   └── (other static image, html and css files)
│
├── index.js
│ 
├── users.json
├── UpdatedDatasetSOI.json
│
├── package.json
└── package-lock.json
```

- Just download the files in this manner and all the dependencies present in package.json, then enter node index.js in the terminal and press enter. Then go to your web browser and type localhost:3000 and press enter.

- Below is a description of each file's use :-

- `index.js`: Provides endpoints for user registration, login, book search, adding books to cart with stock management, and user profile retrieval, all backed by JSON file storage.

- `users.json`: Stores data of the user.

- `UpdatedDatasetSOI.json`: Dataset provided for the project.

- `about.html`: Structure of the design page.

- `index.html`: Structure of the home page.

- `profile.html`: Structure of the profile page.

- `register.html`: Structure of the registration page.

- `search_profile.html`: Structure of the search page that opens after logging in.

- `search.html`: Structure of the search page accessed from the home page.

- `stylef.css`: Stores the design styles of the pages.

- `report_2.pdf`: report_2 of Error_204

- `report_1.pdf`: report_1 of Error_204

Team Members: 
- Richa Rajashekhar
- Dev Kaushal

