module.change_code = 1;
'use strict';

var alexa = require('alexa-app');
var _ = require('lodash');

var app = new alexa.app('test-skill');

var launchMsg = 'Welcome to your test skill. Say a number between one and one hundred, and I will echo it back to you.';
var reprompt = 'If you want me to say a number, you have to tell me which one...';
var errorMsg = 'Sorry, an error occured.';

app.launch(function(request, response) {
    response
        .say(launchMsg)
        .reprompt(reprompt)
        .shouldEndSession(false);
});

app.error = function(exception, request, response) {
    console.log('exception = ' + exception)
    response.say(errorMsg);
};

app.intent('sayNumber', {
        "slots": {
            "number": "NUMBER"
        },
        "utterances": [
            // "say the number {1-100|number}",
            // "give me the number {1-100|number}",
            // "tell me the number {1-100|number}",
            // '{|tell|give} {|me} the number {1-100|number}',
            "I want to hear you say the number {1-100|number}",
            '{|I want you to} {|tell|say|give} {|me} the number {1-100|number}',
        ]
    },
    function(request, response) {
        var number = request.slot('number');
        if (_.isEmpty(number)) {
            var prompt = 'I didn\'t hear a number. Ask me a number and I\'ll echo it back.';
            response
                .say(prompt)
                .reprompt(reprompt)
                .shouldEndSession(false);
            return true;
        } else {
            response
                .say("You asked for the number " + number + ". ")
                .shouldEndSession(false, "Do you want another number?");
        }
    });

//
// Built-in intent to handle a yes from the user.
//
app.intent('AMAZON.YesIntent', {
        "slots": {},
        "utterances": [
            '{|okay|yes|allright}'
        ]
    },
    function(request, response) {
        response
            .say("You said yes.")
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
    var stopOutput = "Don't you worry. I'll be back.";
    response.say(stopOutput);
    return;
});

app.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": [
        "help"
    ]
}, function(request, response) {
    var helpOutput = "This skill will echo the number that you say. You can say any number between one and one hundred. You can also say stop or exit to quit.";
    var reprompt = "What would you like to do?";
    response
        .say(helpOutput)
        .reprompt(reprompt)
        .shouldEndSession(false);
    return;
});

app.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": [
        "cancel"
    ]
}, function(request, response) {
    var cancelOutput = "No problem. Request cancelled.";
    response.say(cancelOutput);
    return;
});

module.exports = app;