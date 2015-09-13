# Plant

This is small [MEAN](http://meanjs.org/) backend to collect data coming from plant **moisture sensors**.

This app is independent from the hardware setup, meaning you can collect from different sources different information on your plants.

To install Node modules run : 
`npm install` 

To run do :
`npm start`

It's configured to run on locahost:4000 (and not the default 3000) for personal convenience :D

The User methods needs an environement variable as a secret key (for Json Web Token generation)
Create a variable named PLANT_SECRET_KEY in you env.
