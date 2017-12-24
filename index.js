/**
 * This is the piano player skill for Amazon Alexa
 */

var Alexa = require('alexa-sdk');

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage     = Alexa.utils.ImageUtils.makeImage;

var songs = require("songs.json");

// valid states in the skill
var states = {
    STARTMODE: '_STARTMODE'
};

// this is used for keep track of visted nodes when we test for loops in the tree
var visited;

// These are messages that Alexa says to the user during conversation

// This is the intial welcome message
var welcomeMessage = "Welcome to piano teacher. Your personal piano teacher. " 
    "Ask me to teach you a song to begin, or say, List Songs, for which I know.";

// This is the message that is repeated if the response to the initial welcome message is not heard
var repeatWelcomeMessage = "You are currently using the piano teacher skill. This skill is designed " +
    "to teach beginner lessons on the piano. Say something like, Teach me how to play " +
    "Mary Had a Little Lamb, to get started.";

// this is the message that is repeated if Alexa does not hear/understand the reponse to the welcome message
var promptToStartMessage = "Say something like, List Songs, to get started.";

// This is the prompt to ask the user if they would like to hear a short description of thier chosen profession or to play again
var playAgainMessage = "Say 'tell me more' to hear a short description about the drink, or do you want to try again?";

// this is the help message during the setup at the beginning of the game
var helpMessage = "I will ask you some questions that will identify the best drink for you would be based on a series of yes no questions. Want to start now?";

// This is the goodbye message when the user has asked to quit the game
var goodbyeMessage = "Ok, see you next time!";

var utteranceTellMeMore = "tell me more";

var utterancePlayAgain = "play again";

// the first node that we will use
//var START_NODE = 1;

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.1de392e9-962b-4a51-9e53-e7001299efa3';
    alexa.registerHandlers(newSessionHandler, startLessonHandlers);
    alexa.execute();
};

// set state to start up
var newSessionHandler = {
    'Welcome': function () {
        console.log("Launch Request");
	// move next utterance to use start mode
	this.handler.state = states.STARTMODE;
        // Display.RenderTemplate directives can be added to the response
        const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
        const imageLoc = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoKeyboard.jpg';
        const template = builder.setTitle('Your Personal Instructor')
                                                        .setBackgroundImage(makeImage(imageLoc))
                                                        .setTextContent(makePlainText('Piano Teacher'))
                                                        .build();

        if (this.event.context.System.device.supportedInterfaces.Display) {
            this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
            this.emit(':responseReady');
            console.log("this was requested by an Echo Show");
        } else {
            this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
        }
    },
    'LaunchRequest': function () {
        console.log("Launch Request");
        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;
        // Display.RenderTemplate directives can be added to the response
        const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
        const imageLoc = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoKeyboard.jpg';
        const template = builder.setTitle('Your Personal Instructor')
                                                        .setBackgroundImage(makeImage(imageLoc))
                                                        .setTextContent(makePlainText('Piano Teacher'))
                                                        .build();

        if (this.event.context.System.device.supportedInterfaces.Display) {
            this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
            this.emit(':responseReady');
            console.log("this was requested by an Echo Show");
        } else {
            this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
        }
    },
    'Unhandled': function () {
        console.log("Unhandled event");
        console.log(JSON.stringify(this.event));
        const unhandledMessage = "Something didn't work on this.";
        this.emit(':ask', unhandledMessage, unhandledMessage);
    }
};

// --------------- Functions that control the skill's behavior -----------------------

// Called at the start of the game, picks and asks first question for the user
var startLessonHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'Welcome': function () {
    	console.log("Launch Request");
    	// Display.RenderTemplate directives can be added to the response
    	const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
    	const imageLoc = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoKeyboard.jpg';
    	const template = builder.setTitle('Your Personal Instructor')
							.setBackgroundImage(makeImage(imageLoc))
							.setTextContent(makePlainText('Piano Teacher'))
							.build();

    	if (this.event.context.System.device.supportedInterfaces.Display) {
	    this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
            this.emit(':responseReady');
  	    console.log("this was requested by an Echo Show");
    	} else {
    	    this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
    	}
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.StartOverIntent': function () {
         this.emit(':ask', promptToStartMessage, promptToStartMessage);
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpMessage, helpMessage);
    },
    'Welcome': function() {
	const message = "Welcome to the Piano Teacher skill. This skill helps " +
	    "to teach beginners how to play the piano.";
     	const repeatMessage = "Are you ready to get started? Say something like, " +
	    "Which songs are available, for a list of what I can teach.";

	console.log("Playing Welcome Function");
	//console.log(JSON.stringify(this.event));

	this.emit(':ask', message, repeatMessage);
    },
    // this plays the basic scale
    'BasicScale': function() {
	console.log("Play the basic C Major scale.");

        // VideoApp.Play directives can be added to the response
        if (this.event.context.System.device.supportedInterfaces.VideoApp) {
	    const videoClip = 'https://s3.amazonaws.com/pianoplayerskill/media/BasicScale.mp4';
	    //this.response.playVideo(videoClip).listen(repeatMessage);
	    const metadata = {
		'title': 'Basic Note Drill'
		//'subtitle': 'composed by Franz Xaver Gruber 1818'
	    };
	    this.response.playVideo(videoClip, metadata);
            console.log("Invoked from video playing device");
        } else {
            this.response.speak("The video cannot be played on your device. " +
            	"To watch this video, try launching the skill from your echo show device.");
            console.log("Cannot play video from this device");
        }

	this.emit(':responseReady');
    },
    // this plays the basic scale in reverse
    'ReverseScale': function() {
        console.log("Play the basic C Major scale in reverse.");

        // VideoApp.Play directives can be added to the response
        if (this.event.context.System.device.supportedInterfaces.VideoApp) {
            const videoClip = 'https://s3.amazonaws.com/pianoplayerskill/media/DownScale.mp4';
            //this.response.playVideo(videoClip).listen(repeatMessage);
            const metadata = {
                'title': 'Reverse Note Drill'
                //'subtitle': 'composed by Franz Xaver Gruber 1818'
            };
            this.response.playVideo(videoClip, metadata);
            console.log("Invoked from video playing device");
        } else {
            this.response.speak("The video cannot be played on your device. " +
                "To watch this video, try launching the skill from your echo show device.");
            console.log("Cannot play video from this device");
        }

        this.emit(':responseReady');
    },
    // this is the function that is invoked when the user requests a song to be played
    'PlaySong': function() {
	const slots = this.event.request.intent.slots;
	var message = "Play Song " + slots.SongName.value + ".";

	console.log("Play Song " + slots.SongName.value + " requested.");

	var validSong = false;
	var videoObject = "";
	var audioObject = "";

	if (slots.SongName.value) {
	    for (i = 0; i < songs.length; i++ ) {
	    	if (slots.SongName.value.toLowerCase() === songs[i].requestName.toLowerCase()) {
		    console.log("User requested valid song.");
		    validSong = true;
		    videoObject = songs[i].videoObject;
		    audioObject = songs[i].audioObject;
		}
	    }
	}

	// check to see if the song is valid
	if (validSong) {
	    // send back the video stream for the mp4 file
	    if (this.event.context.System.device.supportedInterfaces.VideoApp) {
	    	console.log("returned media stream.");
	    	const videoClip = 'https://s3.amazonaws.com/pianoplayerskill/media/' + videoObject;
            	const metadata = {
                    'title': slots.SongName.value
            	};
	    	this.response.playVideo(videoClip, metadata);
	    } else {
		// else play a non-video version of the response
		console.log("playing audio version of song " + slots.SongName.value + ".");
		const audioMessage = 'Okay, get ready to play ' + slots.SongName.value + '.' +
		    '<break time="3s"/>' +
		    '<audio src=\"https://s3.amazonaws.com/pianoplayerskill/audio/' +
		    audioObject + '\" />' +
                    '<break time="3s"/>' +
		    'Would you like to play again?';
		this.response.speak(audioMessage);
		this.response.listen("Would you like to try another song? Just ask for it now.");
	    }
	} else if (!slots.SongName.value) {
	    // error message for no song name provided
	    console.log("did not provide a song name.");
            const repeatMessage = "Would you like me to teach you a song? If so, please provide me " +
                "the song name. For example, say something like, Teach me how to play Twinkle Twinkle " +
                "Little Star.";
	    this.response.speak("Sorry, I didn't hear a song name. Which song do you want to learn?");
	    this.response.listen(repeatMessage);
	} else {
	    // error message for a song name provided that wasn't valid
	    console.log("returned invalid song name error message.");
	    const notFoundMessage = "Sorry, I can't find " + slots.SongName.value + ". If you " +
		"would like to know the songs I do know, say List Songs.";
	    const repeatMessage = "Would you like me to teach you a song? If so, please provide me " +
		"the song name. For example, say something like, Teach me how to play Twinkle Twinkle " +
		"Little Star.";
	    this.response.speak(notFoundMessage);
            this.response.listen(repeatMessage); 
	}
	this.emit(':responseReady');
    },
    // this is the function that returns all the available songs to be played
    'ListSongs': function() {
	console.log("List available songs.");
	
	var message = "Here are the songs currently available. ";
	var repromptMessage = "Would you like me to teach you a song? " +
	    "Just say something like, Teach me how to play " + 
	    songs[0].requestName + ", and I will given instructions on how " +
	    "to play the notes on a piano.";

	console.log("Build song list");
	// get all of the song names from the array
        for (i = 0; i < songs.length; i++ ) {
	    message = message + songs[i].requestName + ", "
	}
	message = message + "Just say something like, Teach me how to play " +
	    songs[0].requestName + ".";

	this.emit(':ask', message, repromptMessage);
    },
    'Unhandled': function () {
	console.log("Unhandled event");
        console.log(JSON.stringify(this.event));
	const unhandledMessage = "Something didn't work on this.";
        this.emit(':ask', unhandledMessage, unhandledMessage);
    }
});
