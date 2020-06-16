function makeUsersArray() {
    return [
        {
            "id": 1,
            "username": "sean",
            "password": "admin",
            "email_address": "powerupsoup@gmail.com",
            "role": "dungeon_master"
        },
        {
            "id": 2,
            "username": "irene",
            "password": "player",
            "email_address": "seanajackson1989@gmail.com",
            "role": "player"
        },
        {
            "id": 3,
            "username": "quinn",
            "password": "player2",
            "email_address": "irenemstaffordlmt@gmail.com",
            "role": "player"
        },
    ];
  }
  
  module.exports = {
    makeUsersArray
  }