# myBlogPost
A blog sharing web app that lets you interact with the blog shared by different users of the application and also lets you create your own blog post. The App allows users to interact with the blogs with likes and comments. Users will also be able to create accounts, authenticate and authorize in the web application. It is a server-side rendering web application which the front end is rendered from the server using ejs as templating engine. Tools & Libraries used are Node.js, Express, RestAPI, Multer, Jsonwebtoken & Firebase.

Step to Run the project: 
1) Clone The Repository to your local repository
2) Configure Your own FIrebase Account
3) Add 2 file into the project folder
  a) serviceAccountKey.json ( Get the service account key from your project setting in Firebase, Generate a new private key and store in the project folder)
  b) .env (Add the json web token secret key:  ACCESS_TOKEN_SECERT=xxxxxxxxxxx)
4) Open your terminal
5) cd to your project folder
6) Run Command: npm install
7) Run Command: npm run dev
8) Try the app at http://localhost:5001/
