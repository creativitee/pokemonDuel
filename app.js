//imports
const { response } = require('express');
const express = require('express');
const path = require('path');
const {  getPokemonDuel, getWeaknesses, mapMovesToType, strengthCount } = require('./public/javascript/pokeFunctions');

//app
const app = express();
let weaknessMap = {};
let moveSet = {};

let formInputs = [];


//handlebars
app.set('view engine', 'hbs');

//serve static files
const publicDir = path.join(__dirname, '/public');
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));


//Middleware method
app.use((req, res, next) => {
    // console.log("Method: " + req.method + "\nPath: " + req.path + "\n");
    next();
  });


//routes
function homeRoute(data){
  app.get('/', (req, res) => {
    res.render('home', {data: JSON.stringify(data)});
})
};


//////////////////////
////////ROUTES////////
//////////////////////

//home page
app.get('/', (req, res) => {
  // res.sendStatus(200);
  res.render('home', {});
});

//duel page
app.get('/pokeDuel', async (req, res) => {
  // const formArray = ['hawlucha', 'clefairy'];
  if (formInputs.length > 0){
    const pokemonList = await getPokemonDuel(formInputs);
    weaknessMap = await getWeaknesses(pokemonList[1]); //get the weaknesses of the second pokemon (in a multiplier map)
    moveSet = await mapMovesToType(pokemonList[0].name, weaknessMap); //get the super effective moveset from the first pokemon
  
    //gets the effective moves and counts
    result = strengthCount(weaknessMap, moveSet);
  
    res.render('pokemonDuel', 
    { 
      pokemonArr: formInputs,
      result,
      spriteOne : pokemonList[0].sprite,
      spriteTwo : pokemonList[1].sprite
    });
  }
  else{
    res.sendStatus(200);
  }
});



//duel form 
app.post('/pokeDuel', (req, res) => {
  if (req.body){
    formInputs = [req.body.pokemonOne, req.body.pokemonTwo];
    res.redirect('/pokeDuel');
  }
  else{
    res.sendStatus(200);
  }
});


app.listen(3000);
console.log("server started at localhost:3000; type CTRL+C to shut down");
