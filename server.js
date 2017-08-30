module.change_code = 1;
'use strict';

var alexa = require('alexa-app');
var _ = require('lodash');

var app = new alexa.app('coffee-skill');

var launchMsg = 'Welcome to the Coffee skill.';
var promptIntro = 'I can help you to order coffee or tea.';
var reprompt = 'Would you like to order some coffee or tea?';
var promptCoffeeOrTea = 'Would you like to order coffee or tea?';
var promptCoffees = 'You can order a cappuchino, a latte, an espresso, a latte machiato, or an american.';
var promptTeas = 'You can order a mint, green tea, jasimine, or earl grey.';
var promptMilkOrSugar = 'Would you like milk, sugar or both?';
var promptHelp = launchMsg + promptIntro + 'We have several coffees. ' +
    promptCoffees + 'You can also order tea. ' + promptTeas;

var errorMsg = 'Sorry, an error occured.';
var outputMissed = 'I didn\'t hear a what drink you\'d like.';
var outputUnavailable = 'I\'m sorry, that drink is unavailable.';
var outputStop = "Don't you worry. I'll be back.";
var outputCancel = "No problem. Request cancelled.";

// State management
const INITIAL_STATE = 0;
const ORDER_COFFEE_STATE = 1;
const ORDER_TEA_STATE = 2;
const ORDER_MILK_SUGAR_STATE = 3;

var state = INITIAL_STATE;
var session;

var coffees = ['coffee', 'cappuchino', 'espresso', 'latte', 'americano'];
var teas = ['green tea', 'mint', 'earl grey', 'jasmine', 'regular']

//
// Launch intent, called at startup of this skill.
//
app.launch(function(request, response) {
    response
        .say(launchMsg)
        .say(promptIntro)
        .say(promptCoffeeOrTea)
        .reprompt(reprompt)
        .shouldEndSession(false);
});

//
// Error handler 
//
app.error = function(exception, request, response) {
    console.log('exception = ' + exception)
    response.say(errorMsg);
};

//
//
//
app.intent('chooseTypeOfDrink', {
        "slots": {
            "number": "NUMBER",
            "orderedDrink": "AMAZON.LITERAL"
        },
        "utterances": [
            // "say the number {1-100|number}",
            // "give me the number {1-100|number}",
            // "tell me the number {1-100|number}",
            // '{|tell|give} {|me} the number {1-100|number}',
            // '{|I want you to} {|tell|say|give} {|me} the number {1-100|number}',
            "{I would like} {|a|an} {1-10|number} {|orderedDrink} {|please}"
        ]
    },
    function(request, response) {
        // Did the user mention a number?
        var number = request.slot('number');
        if (_.isEmpty(number)) { number = 1; };

        // Did the user mention a drink?
        var orderedDrink = request.slot('orderedDrink');
        if (_.isEmpty(orderedDrink)) {
            response
                .say(outputMissed)
                .say(reprompt)
                .reprompt(reprompt)
                .shouldEndSession(false);
            return true;
        } else {

            // 
            // The user ordered some drink. Check if it's what we sell.
            //
            console.log('chooseTypeOfDrink - orderedDrink = ' + orderedDrink);
            if (!_.contains(coffees, orderedDrink) || !_.contains(teas, orderedDrink)) {
                response
                    .say(errorMsg)
                    .shouldEndSession(false, "Do you want another number?");

            } else {
                response
                    .say('You ordered ' + number + orderedDrink)
                    // .say("You asked for the number " + number + ". ")
                    .shouldEndSession(false, "Do you want another number?");
            }
        }
    });

//
// Built-in intent to handle a yes from the user.
//
app.intent('AMAZON.YesIntent', {
        "slots": {},
        "utterances": [
            '{|okay|yes|allright|yeah|ja|yes please|please}'
        ]
    },
    function(request, response) {

        if (request.hasSession()) {
            session = request.getSession();
            console.log('YesIntent - session found. Session = ' + session.details);

        } else {
            console.log('YesIntent - no session found!');
        }

        // handle the yes response. Use more logic and use the session to store skill status.
        switch (state) {
            case INITIAL_STATE:
                response
                    .say('We are in initial state.')
                    .say("What would you like to order?")
                    .shouldEndSession(false);
                break;
            default:
                response
                    .say('We are in default state.')
                    .say("Just for your information: you said yes.")
                    .shouldEndSession(false);
        }
    });

//
// Built-in intent to handle a no from the user.
//
app.intent('AMAZON.NoIntent', {
        "slots": {},
        "utterances": [
            '{|no|no thanks|nope}'
        ]
    },
    function(request, response) {
        // handle the no response. Use more logic and use the session to store skill status.
        response
            .say("Just for your information: you said no.")
            .shouldEndSession(false);
    });

// Amazon has specific intents that have to do with basic functionality of your skill that you 
// must add. Some examples of this are AMAZON.HelpIntent, AMAZON.StopIntent, and 
// AMAZON.CancelIntent. Here are examples of how you would specify these types of intents.    
app.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": [
        "stop",
        "exit",
        "bye"
    ]
}, function(request, response) {
    response.say(outputStop);
    return;
});

//
// Provide help to the user.
//
app.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": [
        "help"
    ]
}, function(request, response) {
    response
        .say(helpOutput)
        .shouldEndSession(false);
    return;
});

//
// Cancel further requests. This ends the interaction with the skill.
//
app.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": [
        "cancel"
    ]
}, function(request, response) {
    response.say(outputCancel);
    return;
});

module.exports = app;