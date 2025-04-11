// project.js - purpose and description here
// Author: Your Name
// Date:

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

const fillers = {
  addendum: ["but it's", "so i'm", "and it's", "and it isn't", "but it isn't", "so it's", "so i'm not", "so it isn't", "and it's not", "but it's not", "so it's not"],
  adjective: ["good", "bad", "better", "worse", "red", "yellow", "green", "purple", "brown", "black", "white", "salty", "sweet", "big", "bigger", "smaller", "small", "average", "normal", "extraordinary", "terrible", "awful", "a significant downgrade", "happy", "sad", "evil", "kind", "in a new era of economic progress", "somewhat akin to a twenty one pilots song"],
  noun: ["bread", "brat", "quantum physics", "the united states government", "the planet mars", "water", "humanity", "a tortilla", "a bird", "a pet rock", "dwayne 'the rock' johnson", "the kitchen sink", "a blender", "a cat", "a dog", "the best album ever", "the worst thing ever", "the best twenty one pilots song"]
  
};

const template = `$noun, $addendum $adjective $addendum $adjective $addendum $adjective`;


// STUDENTS: You don't need to edit code below this line.

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = fillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  /* global box */
  $("#box").text(story);
}

/* global clicker */
$("#clicker").click(generate);

generate();