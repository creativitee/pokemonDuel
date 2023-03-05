//imports
const { response } = require('express');
const express = require('express');
const path = require('path');
const {  getPokemonDuel, getWeaknesses, mapMovesToType, strengthCount } = require('./public/javascript/pokeFunctions');

//app
const app = express();
let weaknessMap = {};
let moveSet = {};

let pokemonArr = [];


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
  const array = await getPokemonDuel(pokemonArr);
  weaknessMap = await getWeaknesses(array[1]); //get the weaknesses of the second pokemon (in a multiplier map)
  moveSet = await mapMovesToType(array[0].name);

  //gets the effective moves and counts
  effectiveMoves = await strengthCount(weaknessMap, moveSet);

  res.render('pokemonDuel', 
  { 
    pokemonArr,
    effectiveMoves
    // weaknessMap : JSON.stringify(weaknessMap),
    // moveSet : JSON.stringify(moveSet)
  });
});



//duel form 
app.post('/pokeDuel', (req, res) => {
  pokemonArr = [req.body.pokemonOne, req.body.pokemonTwo];
  res.redirect('/pokeDuel');
});


// app.post('/', async (req, res) => {
//   const array = [req.body.pokemonOne, req.body.pokemonTwo];
//   // res.redirect('/');
//   // console.log(pokemonArr);
//   await getPokemonDuel(array);
//   res.redirect('/');
// });


/*
function pokeData(dataArr){
  app.get('/', (req, res) => {
    res.render('home', 
    {
      pokemonArr: pokemonArr,
      data: dataArr
    });
  })
}

function getPokemon(){
  fetch("https://pokeapi.co/api/v2/generation/3/")
    .then((response) => response.json())
    .then((data) => homeRoute(data))
    .catch(err => console.error(err))
}

async function getPokemonDuel(pokemonArr){
  const array = [];
  for (const pokemonName of pokemonArr){
    await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonName)
      .then(response => response.json())
      .then((data) => 
      {
        //store pokemon name w/ it's types
        const pokemonObj = {
          'name' : pokemonName
        };
        const typesArray = [];
        for (let pokeType of data.types){
          typesArray.push(pokeType['type'].name);
        }
        pokemonObj.typesArray = typesArray;
        array.push(pokemonObj);
      })
      .catch(err => console.error(err))
  }
  // await Promise.all([mapMovesToType(array[0].name), getWeaknesses(array[1]), strengthCount(moveSet)])
  //   .then((values) => {
  //     pokeData(values);
  //   })
  // let results =
  await mapMovesToType(array[0].name);
  await getWeaknesses(array[1]);

  const count = await strengthCount(moveSet);
  pokeData(count);
}



//what moves your pokemon has that are good against theirs

//Two Pokemon
//Grab their types


//chnage these names to strengths
async function getWeaknesses(pokemon){  
  //loop over the pokemon's types and map the damage relations
  for (const type of pokemon.typesArray){
    await fetch("https://pokeapi.co/api/v2/type/" + type)
      .then(response => response.json())
      .then(data => mapWeaknesses(data['damage_relations']))
      .catch(err => console.error(err))
  }
}

function mapWeaknesses(damage_relations){
  // multiplierMap(damage_relations['no_damage_to'], 0);
  // multiplierMap(damage_relations['half_damage_to'], 0.5);
  // multiplierMap(damage_relations['double_damage_to'], 2);
  multiplierMap(damage_relations['double_damage_from'], 2);
  multiplierMap(damage_relations['half_damage_from'], 0.5);
  multiplierMap(damage_relations['no_damage_from'], 0);
}

function multiplierMap(typesArray, multiplier){
  for (const type of typesArray){
    if (type.name in weaknessMap){
      weaknessMap[type.name + ''] = multiplier * weaknessMap[type.name + ''];
    }
    else{
      weaknessMap[type.name + ''] = multiplier;
    }
  }
}

//count num of moves for each damage relation
async function strengthCount(){
  let effectiveMoves = {};
  let count = 0;
  //want to filter the moveset for double damage moves
  for (const type in moveSet){
    if (weaknessMap.hasOwnProperty(type + '') && weaknessMap[type + '']  >= 2){
      count += moveSet[type + ''].length;
      effectiveMoves[type + ''] = moveSet[type + '']; 
    }
  }
  effectiveMoves.count = count;
  return effectiveMoves;
}


//might want to change it to damaging abilities, change all to same quotes
async function mapMovesToType(pokemon){
  //iterate over the pokemon's moves, and map {type : move}
  await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon)
    .then(response => response.json())
    .then(data => {
      const moves = data.moves;
      //each move, we fetch again
      for (let currentMove of moves){
        mapTypeAndMove(currentMove);
      }
    })
    .catch(err => console.error(err));
}

async function mapTypeAndMove(currentMove){
  await fetch(currentMove.move.url)
    .then(moveResponse => moveResponse.json())
    .then(moveData => { 
        if (moveData.power){
          const moveType = moveData.type.name;
          if (moveSet.hasOwnProperty(moveType + '')){
            moveSet[moveType + ''].push(currentMove.move.name);
          }
          else{
            moveSet[moveType + ''] = [currentMove.move.name];
          }
        }
    })
    .catch(err => console.error(err));
  }
//add an input, css, and images
//Check their weaknesses - grab the type relations of pokemon one, type relations pokemon two, 
async function weaknessCheck(pokemonOne, pokemonTwo){
    const strengthCount = 0;
    const strenghtes = [];
    const pokemonTwoRelations = [];

    for (const type of pokemonOne.typesArray){
      await fetch("https://pokeapi.co/api/v2/type/" + type)
        .then(response => response.json())
        .then(data => pokemonOneRelations.push(data['damage_relations'].double_damage_to))
        .catch(err => console.error(err))
    }

    for (const type of pokemonTwo.typesArray){
      await fetch("https://pokeapi.co/api/v2/type/" + type)
        .then(response => response.json())
        .then(data => pokemonTwoRelations.push(data['damage_relations']))
        .catch(err => console.error(err))
    }

    //we have the damage relations, now do the weakness check - for now lets check double damage, later can do 4x

}

//Count number of strong moves against the other type

//dual types are messed up for second pokemon - maybe stuck in fetch?
// getPokemonDuel(pokemonArr);

*/
app.listen(3000);
console.log("server started at localhost:3000; type CTRL+C to shut down");
