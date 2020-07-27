THE WEST MARCHES API
--------------------

This is a server for managing calls to a blog server. This is a RESTful api the managing users, articles and comments.

Scripts
-------
Start the application npm start

Start nodemon for the application npm run dev

Run the tests npm test

This is a server for managing calls to a blog server. This is a RESTful api the managing users, articles and comments.

Scripts
Start the application npm start

Start nodemon for the application npm run dev

Run the tests npm test

Method:
Here are the endpoints and methods you can call to

    /api/users
    GET | POST

    /api/users/:user_id
    GET | PUT | DELETE
    
    /api/characters
    GET | POST

    /api/characters/:user_id
    GET | PUT | DELETE
    
    /api/notices
    GET | POST

    /api/notices/players
    GET | POST

    /api/notices/characters
    GET | POST

    /api/notices/:notice_id
    GET | PUT

    /api/notices/players/:noticePlayer_id
    GET | PUT

    /api/notices/characters/:noticeCharacter_id
    GET | PUT

Success Response:
Here are some samples of endpoints you can hit and the sort of response you can expect to get back

    /api/users
    GET
    Code: 200
    Content: 
        {"id":1,
        "username":"admin,
        "password":"admin",
        "email_address":"fake_email@gmail.com",
        "role":"dungeon_master"},
        
        {"id":2,
        "username":"player",
        "password":"player",
        "email_address":"player@email.com",
        "role":"player"}

        etc...
        }

    /api/users/1
    GET
    Code: 200
    Content:
        {"id":1,
        "username":"admin",
        "password":"admin",
        "email_address":"fake_email@gmail.com",
        "role":"dungeon_master"}
        

    /api/characters
    GET
    Code: 200
    Content:
        {"id":1,
        "user_id":2,
        "name":"playercharacter"},
        
        {"id":2,
        "user_id":3,
        "name":"player2'scharacter"},
        
        etc...

    /api/characters/1
    GET
    Code: 200
    Content: 
        {"id":1,
        "user_id":2,
        "name":"playercharacter"}

    /api/notices/players
    GET
    Code: 200
    Content: 
        {"id":1,"notice_id":1,
        "name":"player"},

        {"id":2,
        "notice_id":1,
        "name":"player2"},
        
        {"id":3,"notice_id":2,
        "name":"player"}

        etc...

    /api/notices/characters
    GET
    Code: 200
    Content: 
        {"id":1,
        "notice_id":1,
        "name":"playercharacter"},
        
        {"id":2,
        "notice_id":1,
        "name":"player2'scharacter"},
        
        {"id":3,
        "notice_id":2,
        "name":"playercharacter"}

        etc... 

    /api/notices/1
    GET 
    Code: 200
    Content: 
        {"id":1,
        "message":"Loot the dungeon!","status":"Closed"}
