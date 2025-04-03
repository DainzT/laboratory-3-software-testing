# How to RUN OUT TEST?
```
Steps:
1. Copy the url of the repository 
    👉 https://github.com/DainzT/laboratory-2-software-testing.git

2. Open your command prompt, make sure it is in your desired folder.
   👉 To open Command Prompt, press Win + R, type cmd, and hit Enter.

3. execute the command: git clone [paste the url]
    👉 git clone https://github.com/DainzT/laboratory-2-software-testing.git
    
4. make sure you are in the right directory 
   👉 execute: cd laboratory-3-software-testing in your command prompt 
   
   👉 your path should look somewhat like this
   C:\Users\Lenovo\Desktop\your designated folder\laboratory-3-software-testing->

5. now go to the path of the server folder and install all the dependencies:
    👉 execute: cd server
    👉 execute: npm run install or npm install

6. Before running the test, make sure to create an env file for testing at the root of your folder:
     👉 add file: .env.test

7. In the .env.test file paste the following details that will connect to the testing db using prisma postgres:
    👉 DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiZmZiMWQyYTUtYTgzZS00NDNhLWI2MDktMjkzOWRmNzk4MjA5IiwidGVuYW50X2lkIjoiOGYzZGE1MjBlYjAxOWE0NzIxMDMxYjkxNjgxMzU3NGFmNjRkMDY0M2U1ZDdjMjdlZTA1Nzc3NGNiOTQyN2ZhNyIsImludGVybmFsX3NlY3JldCI6Ijg0MjliMzllLWVjOGUtNDMyOS04Y2QxLTZmZDM2MGI5YTFjZSJ9.EXwio9Gdxx1mrPl24kCsRKUCBv_RvaQwnh9gsPl14FE"

7. In the server folder to run the test simply type the command in the command prompt:
    👉 npm run test or npm test

8. Freely explore the other option for verifying the test:
    👉 npm run test:watch -> runs the test every changes you make in the code
    👉 npm run test:setup -> If no schema has been made in the testing db, make sure to initialize the test with the command.
    
8. You are all set, freely explore the Backend folder of the repository. 

11. If error persist do not hesitate to contact either of the people: 
    👉 Kaizen Somosera & Dainz Trasadas.
```

