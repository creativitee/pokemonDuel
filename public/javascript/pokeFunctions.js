const weaknessMap = {};
const moveSet = {};

// takes an array w/ two pokemon - sends backs 3 things (a weakness map, an array of moves, the count of strong moves)
async function getPokemonDuel(pokemonArr) {
    const array = [];

    //iterate over each pokemon in the array
    for (const pokemonName of pokemonArr) {
        await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonName)
            .then(response => response.json())
            .then((data) => {
                //store pokemon name w/ it's types
                // ex. { dragonite : ['flying', 'dragon'] , ...}
                const pokemonObj = {
                    'name': pokemonName
                };
                const typesArray = [];
                for (let pokeType of data.types) {
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

    //once we have poke types - take first pokemon (map the moves the pokemon has to their corresponding types)
    // await mapMovesToType(array[0].name);
    // await getWeaknesses(array[1]);

    // const count = await strengthCount(moveSet);
    // pokeData(count);
    return array;
}



//what moves your pokemon has that are good against theirs

//Two Pokemon
//Grab their types


//chnage these names to strengths
async function getWeaknesses(pokemon) {
    let weaknessMap = {};
    //loop over the pokemon's types and map the damage relations
    for (const type of pokemon.typesArray) {
        const response = await fetch("https://pokeapi.co/api/v2/type/" + type);
        const jsonResp = await response.json();
        weaknessMap = mapWeaknesses(jsonResp['damage_relations'], weaknessMap);
            // .then(response => response.json())
            // .then(data => mapWeaknesses(data['damage_relations']))
            // .catch(err => console.error(err))
    };
    return weaknessMap;
}

function mapWeaknesses(damage_relations) {
    let result = {};
    // multiplierMap(damage_relations['no_damage_to'], 0);
    // multiplierMap(damage_relations['half_damage_to'], 0.5);
    // multiplierMap(damage_relations['double_damage_to'], 2);
    result = multiplierMap(damage_relations['double_damage_from'], 2, result);
    result = multiplierMap(damage_relations['half_damage_from'], 0.5, result);
    result = multiplierMap(damage_relations['no_damage_from'], 0, result);
    return result;
}

function multiplierMap(typesArray, multiplier, weaknessMap) {
    for (const type of typesArray) {
        if (type.name in weaknessMap) {
            weaknessMap[type.name + ''] = multiplier * weaknessMap[type.name + ''];
        }
        else {
            weaknessMap[type.name + ''] = multiplier;
        }
    }
    return weaknessMap;
}

//count num of moves for each damage relation
async function strengthCount(weaknessMap, moveSet) {
    let effectiveMoves = {};
    let count = 0;
    //want to filter the moveset for double damage moves
    for (const type in moveSet) {
        //super effective move!!!!
        if (weaknessMap.hasOwnProperty(type + '') && weaknessMap[type + ''] >= 2) {
            count += moveSet[type + ''].length;
            effectiveMoves[type + ''] = moveSet[type + ''];
        }
    }
    effectiveMoves.count = count;
    return effectiveMoves;
}


//might want to change it to damaging abilities, change all to same quotes

// { ground : ['eq', 'dig'], ...}
async function mapMovesToType(pokemon) {
    //iterate over the pokemon's moves, and map {type : move}
    let moveSet = {};
    const pokemonData = await (await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon)).json();
    const pokemonMoves = pokemonData.moves;

    //iterate over the moves - place the moves into a moveset table
    for (const currentMove of pokemonMoves){
        moveSet = await mapTypeToMove(currentMove, moveSet);
    }
        // .then(response => response.json())
        // .then(data => {
        //     const moves = data.moves;
        //     //each move, we fetch again
        //     for (let currentMove of moves) {
        //         mapTypeToMove(currentMove);
        //     }
        // })
        // .catch(err => console.error(err));
    return moveSet;
}

//parameters: a move, map ( ex: {ground: ['eq', 'dig']})
//result: takes the move, gets the typing, and adds it to an array that mapes types to moves
async function mapTypeToMove(currentMove, moveSet) {
    const moveData = await (await fetch(currentMove.move.url)).json();
    //move is an attacking move
    if (moveData.power) {
        const moveType = moveData.type.name;
        //check if our mapper contains the move's type
        if (moveSet.hasOwnProperty(moveType + '')) {
            //push to the array of moves corresponding to that type
            moveSet[moveType + ''].push(currentMove.move.name);
        }
        else {
            //otherwise - create a new array w/ the move inside mapped to corresponding type
            moveSet[moveType + ''] = [currentMove.move.name];
        }
    }
    return moveSet; 
        // .then(moveResponse => moveResponse.json())
        // .then(moveData => {
        //     if (moveData.power) {
        //         const moveType = moveData.type.name;
        //         if (moveSet.hasOwnProperty(moveType + '')) {
        //             moveSet[moveType + ''].push(currentMove.move.name);
        //         }
        //         else {
        //             moveSet[moveType + ''] = [currentMove.move.name];
        //         }
        //     }
        // })
        // .catch(err => console.error(err));
}


//add an input, css, and images
//Check their weaknesses - grab the type relations of pokemon one, type relations pokemon two, 
async function weaknessCheck(pokemonOne, pokemonTwo) {
    const strengthCount = 0;
    const strenghtes = [];
    const pokemonTwoRelations = [];

    for (const type of pokemonOne.typesArray) {
        await fetch("https://pokeapi.co/api/v2/type/" + type)
            .then(response => response.json())
            .then(data => pokemonOneRelations.push(data['damage_relations'].double_damage_to))
            .catch(err => console.error(err))
    }

    for (const type of pokemonTwo.typesArray) {
        await fetch("https://pokeapi.co/api/v2/type/" + type)
            .then(response => response.json())
            .then(data => pokemonTwoRelations.push(data['damage_relations']))
            .catch(err => console.error(err))
    }

    //we have the damage relations, now do the weakness check - for now lets check double damage, later can do 4x
}

module.exports = {
    getPokemonDuel,
    getWeaknesses,
    mapMovesToType,
    strengthCount
}