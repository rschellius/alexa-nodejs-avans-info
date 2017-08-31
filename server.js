module.change_code = 1;
'use strict';

var alexa = require('alexa-app');
var _ = require('underscore');

var app = new alexa.app('coffee-skill');

var launchMsg = 'Welcome to the barista skill.';
var promptIntro = 'I can help you to order coffee or tea. We have several flavors available.';
var reprompt = 'Would you like to order anything?';
var promptCoffeeOrTea = 'What would you like?';
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
var outputTypes = "We serve four types of coffee, and five types of tea.";
var outputCoffees = "We serve regular coffee, cappuchino, espresso, latte, and americano.";
var outputTeas = "We serve regular tea, mint, earl grey, jasmine, and gree tea.";

// State management
const INITIAL_STATE = 0;
const ORDER_COFFEE_STATE = 1;
const ORDER_TEA_STATE = 2;
const ORDER_MILK_SUGAR_STATE = 3;

var state = INITIAL_STATE;
var session;

var coffees = ['coffee', 'cappuchino', 'espresso', 'latte', 'americano'];
var teas = ['tea', 'green tea', 'mint', 'earl grey', 'jasmine', 'regular']

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
    response
        .say(outputMissed)
        .say(promptCoffeeOrTea)
        .shouldEndSession(false);
};

//
//
//
// app.dictionary = { "coffees": coffees };
app.intent('chooseTypeOfDrink', {
        "slots": {
            "number": "NUMBER",
            "orderedDrink": "Drinks"
        },
        "utterances": [
            "{1-10|number} {-|orderedDrink}",
            "{1-10|number} {-|orderedDrink} please",
            "I would like {1-10|number} {-|orderedDrink}",
            "I would like {1-10|number} {-|orderedDrink} please",
            "{could I have|give me|I would like} {a |an |} {-|orderedDrink} {please |}"
        ]
    },
    function(request, response) {
        // Did the user mention a number?
        var number = request.slot('number');
        if (_.isEmpty(number) || number <= 0) { number = 1; };

        // 
        // Depending on the state we take an action.
        //
        console.log('chooseTypeOfDrink - current state = ' + printState(state));
        switch (state) {
            case INITIAL_STATE:

                // Did the user mention a drink?
                var orderedDrink = request.slot('orderedDrink');
                if (_.isEmpty(orderedDrink)) {
                    // 
                    // No drink ordered.
                    //
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
                    console.log('chooseTypeOfDrink - order = ' + number + ' ' + orderedDrink);

                    //
                    // Persist the type of drink in the session
                    //
                    if (request.hasSession()) {
                        session = request.getSession();
                        session.set('drink', orderedDrink);
                        session.set('amount', number);
                    }

                    if (_.contains(coffees, orderedDrink)) {
                        state = ORDER_COFFEE_STATE;
                        response
                            .say('You chose ' + number + ' ' + orderedDrink)
                            .say(promptMilkOrSugar)
                            .shouldEndSession(false, promptMilkOrSugar);
                    } else if (_.contains(teas, orderedDrink)) {
                        state = ORDER_TEA_STATE
                        response
                            .say('You chose ' + number + ' ' + orderedDrink)
                            .say(promptMilkOrSugar)
                            .shouldEndSession(false, promptMilkOrSugar);
                    } else {
                        console.log('chooseTypeOfDrink - ' + orderedDrink + ' is not available');
                        response
                            .say(errorMsg)
                            .say("Please order a different drink.")
                            .shouldEndSession(false, "Would you like to make an order?");
                    }
                };
                break;
            default:
                console.log('chooseCoffeeOrTea - invalid state');
                response
                    .say('I am sorry, that request is invalid in this state.')
                    .shouldEndSession(false, "Do you want to order something?");
        };
    });

//
// "What coffee or tea do you serve?"
//
app.intent('whatTypesOfDrink', {
        "slots": {
            "orderedDrink": "Drinks"
        },
        "utterances": [
            "what {type|sort} of {coffee|tea} or {coffee|tea} do you {have|serve|offer|have to offer|provide}",
            "what {type|sort} of {-|orderedDrink} do you {have|serve|offer|have to offer|provide}"
        ]
    },
    function(request, response) {

        var orderedDrink = request.slot('orderedDrink');
        if (_.isEmpty(orderedDrink)) {
            response
                .say(outputTypes + outputCoffees + outputTeas)
                .say(promptCoffeeOrTea)
                .shouldEndSession(false);
            return true;
        } else if (orderedDrink === "coffee") {
            response
                .say(outputTypes + outputCoffees)
                .say(promptCoffeeOrTea)
                .shouldEndSession(false);
        } else {
            response
                .say(outputTypes + outputTeas)
                .say(promptCoffeeOrTea)
                .shouldEndSession(false);
        }

    });

//
// "What coffee or tea do you serve?"
//
app.intent('milkOrSugar', {
        "slots": {
            "additions": "Additions"
        },
        "utterances": [
            "{-|additions} {please |}"
        ]
    },
    function(request, response) {

        var additions = request.slot('additions');
        if (_.isEmpty(additions)) {
            response
                .say("I'm sorry, I didn't hear your choice.")
                .say(promptMilkOrSugar)
                .shouldEndSession(false);
        } else if (orderedDrink === "coffee") {
            response
                .say(outputTypes + outputCoffees)
                .say(promptCoffeeOrTea)
                .shouldEndSession(false);
        } else {
            response
                .say(outputTypes + outputTeas)
                .say(promptCoffeeOrTea)
                .shouldEndSession(false);
        }
        return;
    });

//
// Built-in intent to handle a yes from the user.
//
app.intent('AMAZON.YesIntent', {
        "slots": {},
        "utterances": [
            '{okay|yes|allright|yeah|ja|yes please|please}'
        ]
    },
    function(request, response) {

        var drink = "drink";

        if (request.hasSession()) {
            session = request.getSession();
            drink = session.get("drink");
        }
        console.log('YesIntent - current state = ' + printState(state));

        // handle the yes response. Use more logic and use the session to store skill status.
        switch (state) {
            case INITIAL_STATE:
                response
                    .say('We are in initial state.')
                    .say("What would you like to order?")
                    .shouldEndSession(false);
                break;
            case ORDER_COFFEE_STATE:
                response
                    .say("You ordered milk and sugar with your " + drink)
                    .say("Would you like anything else?")
                    .shouldEndSession(false);
                break;
            case ORDER_TEA_STATE:
                response
                    .say("You ordered milk and sugar with your " + drink)
                    .say("Would you like anything else?")
                    .shouldEndSession(false);
                break;
            case ORDER_MILK_SUGAR_STATE:
                response
                    .say("You ordered milk and sugar with your " + drink)
                    .say("Would you like anything else?")
                    .shouldEndSession(false);
                break;
            default:
                response
                    .say('We are in an unknown state.')
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
            '{no|no thanks|nope}'
        ]
    },
    function(request, response) {
        console.log('NoIntent - current state = ' + printState(state));

        // handle the no response. Use more logic and use the session to store skill status.
        response
            .say("I heard you say no.")
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

var printState = function(state) {
    var string;
    switch (state) {
        case INITIAL_STATE:
            string = "INITIAL_STATE";
            break;
        case ORDER_COFFEE_STATE:
            string = "ORDER_COFFEE_STATE";
            break;
        case ORDER_TEA_STATE:
            string = "ORDER_TEA_STATE";
            break;
        case ORDER_MILK_SUGAR_STATE:
            string = "ORDER_MILK_SUGAR_STATE";
            break;
        default:
            string = "unknown state";
    }
    return string;
}

module.exports = app;