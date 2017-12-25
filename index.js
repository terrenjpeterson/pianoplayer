/**
 * This is the piano player skill for Amazon Alexa
 */

var Alexa = require('alexa-sdk');

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage     = Alexa.utils.ImageUtils.makeImage;

// these are the songs that recordings have been made for
var songs = require("songs.json");

// valid states in the skill
var states = {
    STARTMODE: '_STARTMODE'
};

// These are messages that Alexa says to the user during conversation

// This is the intial welcome message
const welcomeMessage = "Welcome to the piano teacher skill, your personal instructor. " +
    "Ask me to teach you a song to begin, or say, List Songs, for which I know.";

// This is the message that is repeated if the response to the initial welcome message is not heard
const repeatWelcomeMessage = "You are currently using the piano teacher skill. This skill is designed " +
    "to teach beginner lessons on the piano. Say something like, Teach me how to play " +
    "Mary Had a Little Lamb, to get started.";

// this is the message that is repeated if Alexa does not hear/understand the reponse to the welcome message
const promptToStartMessage = "Say something like, List Songs, to get started.";

// this is the help message during the setup at the beginning of the game
const helpMessage = "This skill has the ability to provide beginner lessons for the piano. " +
    "To begin, say, Teach me how to play the scale, and I will go through the individual " +
    "notes on a scale. There are also many different songs that I can teach. Say, List Songs " +
    "for a complete list, then ask me to teach you one, and I will provide the notes to go along.";

// these are messages when a song requested was invalid
const noSongMessage = "Sorry, I didn't hear a song name. Which song do you want to learn?";
const noSongRepeatMessage = "Would you like me to teach you a song? If so, please provide me " +
    "the song name. For example, say something like, Teach me how to play Twinkle Twinkle Little Star.";

// This is the goodbye message when the user has asked to quit the game
const goodbyeMessage = "Ok, see you next time!";

// This is the initial background image played at the launch of the skill
const musicBackground = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoKeyboard.jpg';

// These are the folders where the mp3 & mp4 files are located
const audioLoc = 'https://s3.amazonaws.com/pianoplayerskill/audio/';
const videoLoc = 'https://s3.amazonaws.com/pianoplayerskill/media/';

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.1de392e9-962b-4a51-9e53-e7001299efa3';
    alexa.dynamoDBTableName = 'PianoEchoShow';
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
        const imageLoc = musicBackground;
        const template = builder.setTitle('Your Personal Instructor')
                                                        .setBackgroundImage(makeImage(imageLoc))
                                                        .setTextContent(makePlainText('Piano Teacher'))
                                                        .build();

        if (this.event.context.System.device.supportedInterfaces.Display) {
            this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
	    this.attributes['EchoShow'] = true;
            console.log("this was requested by an Echo Show");
            this.emit(':responseReady');
        } else {
            this.attributes['EchoShow'] = false;
            this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
        }
    },
    'LaunchRequest': function () {
        console.log("Launch Request");
        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;
        // Display.RenderTemplate directives can be added to the response
        const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
        const imageLoc = musicBackground;
        const template = builder.setTitle('Your Personal Instructor')
                                                        .setBackgroundImage(makeImage(imageLoc))
                                                        .setTextContent(makePlainText('Piano Teacher'))
                                                        .build();

        if (this.event.context.System.device.supportedInterfaces.Display) {
            this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
            console.log("this was requested by an Echo Show");
            this.attributes['EchoShow'] = true;
            this.emit(':responseReady');
        } else {
            this.attributes['EchoShow'] = false;
            this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
        }
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpMessage, helpMessage);
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
    	const imageLoc = musicBackground;
    	const template = builder.setTitle('Your Personal Instructor')
							.setBackgroundImage(makeImage(imageLoc))
							.setTextContent(makePlainText('Piano Teacher'))
							.build();

    	if (this.event.context.System.device.supportedInterfaces.Display) {
	    this.response.speak(welcomeMessage).listen(repeatWelcomeMessage).renderTemplate(template);
            this.attributes['EchoShow'] = true;
  	    console.log("this was requested by an Echo Show");
            this.emit(':responseReady');
    	} else {
            this.attributes['EchoShow'] = false;
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
	console.log("Playing Welcome Function");
	this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
    },
    // this plays the basic scale
    'BasicScale': function() {
	console.log("Play the basic C Major scale.");

	// If the device is able to play video pass video, else audio
        if (this.event.context.System.device.supportedInterfaces.VideoApp) {
	    const videoClip = videoLoc + 'BasicScale.mp4';
	    const metadata = {
		'title': 'Basic Note Drill'
	    };
	    this.response.playVideo(videoClip, metadata);
            console.log("Invoked from video playing device");
        } else {
            const audioMessage = 'Okay, get ready to play the scale starting with the ' +
		'middle C, then go up a white key until you hit the high C.' +
                '<break time="3s"/>' +
                '<audio src=\"' + audioLoc + 'PianoScale.mp3\" />' +
                '<break time="3s"/>' +
                'Would you like to play again? If so, say, Play the scale. ' +
		'If you would like to play in reverse, say, Play scale in reverse.';
	    const repeatMessage = 'If you want to try again, say, Play the scale. ' +
		'To play in reverse, say, Play scale in reverse.';

            this.response.speak(audioMessage).listen(repeatMessage);
            console.log("Playing from non-video device");
        }
	this.emit(':responseReady');
    },
    // this plays the basic scale in reverse
    'ReverseScale': function() {
        console.log("Play the basic C Major scale in reverse.");

	// If the device is able to play video pass video, else audio
        if (this.event.context.System.device.supportedInterfaces.VideoApp) {
            const videoClip = videoLoc + 'DownScale.mp4';
            const metadata = {
                'title': 'Reverse Note Drill'
            };
            this.response.playVideo(videoClip, metadata);
            console.log("Invoked from video playing device");
        } else {
            const audioMessage = 'Okay, get ready to play the scale in reverse starting with the ' +
                'high C, then go up a white key until you hit the middle C.' +
                '<break time="3s"/>' +
                '<audio src=\"' + audioLoc + 'DownScale.mp3\" />' +
                '<break time="3s"/>' +
                'Would you like to play again? If so, say, Play the scale in reverse. ' +
                'If you would are ready to play a song, say, List songs, then select one.';
            const repeatMessage = 'If you want to try again, say, Play scale in reverse. ' +
                'To play going back up, please say, Play the scale.';

            this.response.speak(audioMessage).listen(repeatMessage);
            console.log("Playing from non-video device");
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
	    	const videoClip = videoLoc + videoObject;
            	const metadata = {
                    'title': slots.SongName.value
            	};
	    	this.response.playVideo(videoClip, metadata);
	    } else {
		// else play a non-video version of the response
		console.log("playing audio version of song " + slots.SongName.value + ".");
		const audioMessage = 'Okay, get ready to play ' + slots.SongName.value + '.' +
		    '<break time="3s"/>' +
		    '<audio src=\"' + audioLoc + audioObject + '\" />' +
                    '<break time="3s"/>' +
		    'Would you like to play again? If so, please say, Teach me how to play ' +
		    slots.SongName.value + ".";
		this.response.speak(audioMessage);
		this.response.listen("Would you like to try another song? Just ask for it now.");
	    }
	} else if (!slots.SongName.value) {
	    // error message for no song name provided
	    console.log("did not provide a song name.");
	    this.response.speak(noSongMessage).listen(noSongRepeatMessage);
	} else {
	    // error message for a song name provided that wasn't valid
	    console.log("returned invalid song name error message.");
	    const notFoundMessage = "Sorry, I can't find " + slots.SongName.value + ". If you " +
		"would like to know the songs I do know, say List Songs.";
	    this.response.speak(notFoundMessage).listen(noSongRepeatMessage); 
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
