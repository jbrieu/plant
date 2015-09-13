# Plant

This is small [MEAN](http://meanjs.org/) backend to collect data coming from plant **moisture sensors**.

This app is independent from the hardware setup, meaning you can collect from different sources different information on your plants.

To install Node modules run : 
`npm install` 

To run do (mongod must be started) :
`npm start`

It's configured to run on locahost:4000 (and not the default 3000) for personal convenience :D

The User methods needs an environement variable as a secret key (for Json Web Token generation)
Create a variable named PLANT_SECRET_KEY in you env.

To use the API with a secured user (POST and PUT actions) : 
 * register a new user for the API access in the interface
 * go to your localStorage with your browser developper tool
 * copy the value for the field : "plant-token" => it's the [JWT](jwt.io) for this user
 * in your API call add a header field "Authorization"
 * populate the value with "Bearer " followed by your JWT string
 
 
