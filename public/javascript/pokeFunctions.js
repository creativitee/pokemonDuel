// takes an array w/ two pokemon - sends backs 3 things (a weakness map, an array of moves, the count of strong moves)
async function getPokemonDuel(pokemonArr) {
    const array = [];

    //iterate over each pokemon in the array
    for (const pokemonName of pokemonArr) {
        const pokemonData = await (await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonName)).json();
        // const typesArray = pokemonData.types.map(typeSlot => typeSlot.type.name);
        const pokemonObj = {
            'name': pokemonName,
            typesArray : pokemonData.types.map(typeSlot => typeSlot.type.name),
            sprite : pokemonData.sprites['front_default']
        };
        array.push(pokemonObj);
    }
    return array;
}


//chnage these names to strengths
async function getWeaknesses(pokemon) {
    let weaknessMap = {};
    //loop over the pokemon's types and map the damage relations
    for (const type of pokemon.typesArray) {
        const jsonResp = await (await fetch("https://pokeapi.co/api/v2/type/" + type)).json();
        weaknessMap = mapWeaknesses(jsonResp['damage_relations'], weaknessMap);
    };
    // console.log(weaknessMap);
    return weaknessMap;
}

function mapWeaknesses(damage_relations, weaknessMap) {
    // multiplierMap(damage_relations['no_damage_to'], 0);
    // multiplierMap(damage_relations['half_damage_to'], 0.5);
    // multiplierMap(damage_relations['double_damage_to'], 2);
    weaknessMap = multiplierMap(damage_relations['double_damage_from'], 2, weaknessMap);
    weaknessMap = multiplierMap(damage_relations['half_damage_from'], 0.5, weaknessMap);
    weaknessMap = multiplierMap(damage_relations['no_damage_from'], 0, weaknessMap);

    return weaknessMap;
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
function strengthCount(weaknessMap, moveSet) {
    let result = {};
    let moveMap = {};
    let count = 0;
    //want to filter the moveset for double damage moves
    for (const type in moveSet) {
        //super effective move!!!!
        // if (weaknessMap.hasOwnProperty(type + '') && weaknessMap[type + ''] >= 2) {
            count += moveSet[type + ''].length;
            moveMap[type + ''] = moveSet[type + ''];
        // }
    }
    result = {
        moveMap,
        count
    }
    return result;
}


//might want to change it to damaging abilities, change all to same quotes

// { ground : ['eq', 'dig'], ...}
async function mapMovesToType(pokemon, weaknessMap) {
    //iterate over the pokemon's moves, and map {type : move}
    let moveSet = {};
    const pokemonData = await (await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon)).json();
    const pokemonMoves = pokemonData.moves;

    //iterate over the moves - place the moves into a moveset table
    for (const currentMove of pokemonMoves){
        moveSet = await mapTypeToMove(currentMove, moveSet, weaknessMap);
    }
    return moveSet;
}

//parameters: a move, map ( ex: {ground: ['eq', 'dig']})
//result: takes the move, gets the typing, and adds it to an array that mapes types to moves
async function mapTypeToMove(currentMove, moveSet, weaknessMap) {
    const moveData = await (await fetch(currentMove.move.url)).json();
    //move is an attacking move
    const moveType = moveData.type.name;
    // && weaknessMap[moveType + ''] < 2
    if (moveData.power && (weaknessMap.hasOwnProperty(moveType + '') && weaknessMap[moveType + ''] >= 2)) {
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
}

module.exports = {
    getPokemonDuel,
    getWeaknesses,
    mapMovesToType,
    strengthCount
}