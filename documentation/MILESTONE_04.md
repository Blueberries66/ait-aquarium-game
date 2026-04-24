Milestone 04 - Final Project Documentation
===

NetID
---
zs3067

Name
---
Emily Shi

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66

URL for deployed site 
---
(TODO: add url for your dpeloyed site)

URL for form 1 (from previous milestone) 
---
https://final-project-blueberries66-1.onrender.com/

Special Instructions for Form 1
---
user needs to register, passwork needs at least 8 characters

URL for form 2 (for current milestone)
---
https://final-project-blueberries66-1.onrender.com/tank/69ead95baa1f286c662b9f87

Special Instructions for Form 2
---
link to tank, not sure if just linking this way works since there's the login/register step

URL for form 3 (from previous milestone) 
---
https://final-project-blueberries66-1.onrender.com/shop

Special Instructions for Form 3
---
(TODO: if your app requires special instructions to use or if your app requires authentication, add information here; otherwise, leave blank)

First link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/blob/main/models/user.mjs#L9-L11

Second link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/blob/main/views/tank.ejs#L117-L186

Short description for links above
---
comparePassword is a method added in the User schema that uses bcrypt to compare a login password with the stored hashed password.

The animation code in tank.ejs uses higher-order functions like map and forEach to create and update fish objects, and apply an animation loop

Link to github line number(s) for schemas (db.js or models folder)
---
https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/tree/main/models

Description of research topics above with points
---
* (4 points) Socket.io for real-time events
    * Socket.io will be used to handle real-time currency updates on click and to trigger live visitor arrival events without requiring a page refresh
* (3 points) Tailwind CSS
    * I will use Tailwind CSS to style the aquarium pages, shop, and collection pages
* (3 points) Authentication / session management
    * I will use a library such as express-session and connect-mongo, or another authentication-related library, so that users can log in and keep separate aquarium data
    * this also helps satisfy privacy/security expectations for user-specific data


Links to github line number(s) for research topics described above (one link per line)
---
socket: https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/blob/main/app.mjs#L338-L363

tailwind: https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/tree/main/views

auth: https://github.com/nyu-csci-ua-0467-001-002-spring-26/final-project-Blueberries66/blob/main/app.mjs#L80-L121

Optional project notes 
--- 
(TODO: optionally add add any other information required for using/testing the final project)

Attributions
---
(TODO:  list sources that you have based your code off of, 1 per line, with file name, a very short description, and an accompanying url... for example: routes/index.js - Authentication code based off of http://foo.bar/baz ... alternatively, if you have already placed annotations in your project, answer "See source code comments")
