/**
 * This is the piano player skill for Amazon Alexa
 */

var Alexa = require('alexa-sdk');

// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage     = Alexa.utils.ImageUtils.makeImage;

// these are the songs that recordings have been made for
var songs = require("songs.json");

// these are the lessons that invoke different intents
var lessons = require("lessons.json");

// valid states in the skill
var states = {
    STARTMODE: '_STARTMODE'
};

// These are messages that Alexa says to the user during conversation

// This is the intial welcome message
const welcomeMessage = "Welcome to the piano teacher skill, your personal instructor. " +
    "Ask me to teach you a song to begin, or say, List Songs, and I will list what is available.";

// This is the message that is repeated if the response to the initial welcome message is not heard
const repeatWelcomeMessage = "You are currently using the piano teacher skill. This skill is designed " +
    "to teach beginner lessons on the piano. Say something like, Teach me how to play " +
    "Mary Had a Little Lamb, to get started.";

// this is the message that is repeated if Alexa does not hear/understand the reponse to the welcome message
const promptToStartMessage = "Say something like, List Songs, to get started.";

// this is the help message during the setup at the beginning of the game
const helpMessage = "This skill has the ability to provide beginner lessons for the piano. " +
    "To begin, say, Teach me how to play the scale, and I will go through the individual " +
    "notes on a scale. " +
    "As you are beginning to learn musical notes, see how well you can recognize them " +
    "by saying 'Play musical note guessing game' and see how many notes in a row you can recognize. " +
    "There are also many different songs that I can teach. Say, List Songs " +
    "for a complete list, then ask me to teach you one, and I will provide the notes to go along.";

// these are messages when a song requested was invalid
const noSongMessage = "Sorry, I didn't hear a song name. Which song do you want to learn?";
const noSongRepeatMessage = "Would you like me to teach you a song? If so, please provide me " +
    "the song name. For example, say something like, Teach me how to play Twinkle Twinkle Little Star.";

// this is the message after the chord lesson is taught
const repromptChordMessage = "Would you like to learn another lesson? If so, " +
    "please say something like, List Lessons, and I will read out what is " +
    "currently available.";

// This is the goodbye message when the user has asked to quit the game
const goodbyeMessage = "Ok, see you next time!";

// Tis is the unhandled message when the skill is invoked, but unclear of 
const unhandledMessage = "I'm sorry, I didn't understand your request. Would you like me to " +
   "teach you a song? If so, please say something like, List Songs, to get started.";

// These are the backgrounds used to display on the screen including the initial launch
const musicBackground = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoKeyboard.jpg';
const pianoStrings = 'https://s3.amazonaws.com/pianoplayerskill/logos/pianoStrings.jpg';

// These are the folders where the mp3 & mp4 files are located
const audioLoc = 'https://s3.amazonaws.com/pianoplayerskill/audio/';
const videoLoc = 'https://s3.amazonaws.com/pianoplayerskill/media/';
const musicNoteFolder = "\"https://s3.amazonaws.com/pianoplayerskill/musicNotes/";
const chordExample = 'https://s3.amazonaws.com/pianoplayerskill/musicChords/CMajorChord.mp3';

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
        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;
        this.emit(':ask', helpMessage, helpMessage);
    },
    // this plays the basic scale
    'BasicScale': function() {
	console.log("Play the basic C Major scale.");

        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

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

        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

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

        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

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
	console.log("List available songs - unused version?");
	
        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

	var message = "Here are the songs currently available. ";
	var repromptMessage = "Would you like me to teach you a song? " +
	    "Just say something like, Teach me how to play " + 
	    songs[0].requestName + ", and I will given instructions on how " +
	    "to play the notes on a piano.";

	console.log("Build song list");
	// get all of the valid song names from the array
        for (i = 0; i < songs.length; i++ ) {
	    if (songs[i].listSong) {
	        message = message + songs[i].requestName + ", "
	    }
	}
	message = message + "Just say something like, Teach me how to play " +
	    songs[0].requestName + ".";

	this.emit(':ask', message, repromptMessage);
    },
    // this is the function that lists off what lessons are available
    'ListLessons': function() {
	console.log("List available lessons");

        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

        var message = "Here are the lessons currently available. ";
        const repromptListLessonMessage = "Would you like me to teach you a lesson? " +
            "Just say something like, Teach me how to play the scale.";

        console.log("Build lessons list");
        // get all of the valid lesson names from the array
        for (i = 0; i < lessons.length; i++ ) {
            message = message + lessons[i].requestName + ", "
        }
        message = message + "Just say something like, Teach me how to play " +
            " the scale.";

        this.emit(':ask', message, repromptListLessonMessage);
    },
    // this is the function that describes what a chord is
    'ExplainChords': function() {
	console.log("Explain what a chord is.");
	
        // move next utterance to use start mode
        this.handler.state = states.STARTMODE;

	var message = 'A chord is a group of at least three notes that can be played ' +
	    'together and form the harmony. These are typically played with ' +
	    'your left hand while your right hand plays the melody. ' +
	    'An example is the Chord C Major. It is the C, E, and G notes played together ' +
	    'like this.' +
            '<break time="1s"/>' +
            '<audio src=\"' + chordExample + '\" />' +
            '<break time="1s"/>' +
	    'These keys are pressed with your pinky, middle finger, and thumb. ' +
	    'If you would like to learn how to play a song, say List Songs to get started.';

	this.emit(':ask', message, repromptChordMessage);
    },	
    'Unhandled': function () {
        console.log("Unhandled event");
        console.log(JSON.stringify(this.event));
        this.emit(':ask', unhandledMessage, unhandledMessage);
    }
};

// --------------- Functions that control the skill's behavior -----------------------

// Called at the start of the game, picks and asks first question for the user
var startLessonHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'LaunchRequest': function () {
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
    // this is invoked by a touch on the Echo Show screen from a list item
    'ElementSelected': function() {
        console.log("Element Selected:" + this.event.request.token);
	var videoName = "";
	// match token to song name and find the video object to play
	for (i = 0; i < songs.length; i++ ) {
	    if (songs[i].token === this.event.request.token) {
		console.log("Play " + songs[i].requestName);
		videoName = songs[i].videoObject;
	    }
	}
        const videoClip = videoLoc + videoName;
        //const metadata = {
        //    'title': 'Basic Note Drill'
        //    };
        this.response.playVideo(videoClip);
	this.emit(':responseReady');
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

	// check if video enabled device - if so, build visual list
        if (this.event.context.System.device.supportedInterfaces.VideoApp) {
	    console.log("being played by a supported video device.");
	    //const itemImage = makeImage('https://url/to/imageResource', imageWidth, imageHeight);
	    const itemImage = null;
    	    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
            const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate1Builder();
	    // build list of all available songs
            for (i = 0; i < songs.length; i++ ) {
                if (songs[i].listSong) {
		    // pull attributes from song array and apply to the list
		    listItemBuilder.addItem(null, songs[i].token, makePlainText(songs[i].requestName), 
			makePlainText(songs[i].difficulty));
                    message = message + songs[i].requestName + ", "
                }
            }
	    message = message + "Just select on the screen a song, or request by saying something " +
		"like, Teach me how to play " + songs[0].requestName + ".";

    	    const listItems = listItemBuilder.build();
	    const imageLoc  = pianoStrings;
    	    const listTemplate = listTemplateBuilder.setToken('listToken')
    										.setTitle('Available Song List')
    										.setListItems(listItems)
										.setBackgroundImage(makeImage(imageLoc))
    										.build();
	    console.log(JSON.stringify(listTemplate));
    	    this.response.speak(message).listen(noSongRepeatMessage).renderTemplate(listTemplate);
    	    this.emit(':responseReady');
	} else {
	    // song list requested by something other than an Echo Show - so just build audio response
	    console.log("Build song list for non-video device");
	    // get all of the song names from the array
            for (i = 0; i < songs.length; i++ ) {
            	if (songs[i].listSong) {
                    message = message + songs[i].requestName + ", "
            	}
            }
	    message = message + "Just say something like, Teach me how to play " +
	    	songs[0].requestName + ".";

	    this.emit(':ask', message, repromptMessage);
        }
    },
    // this is the function that lists off what lessons are available
    'ListLessons': function() {
        console.log("List available lessons");

        var message = "Here are the lessons currently available. ";
        var repromptMessage = "Would you like me to teach you a lesson? " +
            "Just say something like, Teach me how to play the scale.";

        console.log("Build lessons list");
        // get all of the valid lesson names from the array
        for (i = 0; i < lessons.length; i++ ) {
            message = message + lessons[i].requestName + ", "
        }
        message = message + "Just say something like, Teach me how to play " +
            " the scale.";

        this.emit(':ask', message, repromptMessage);
    },
    // this is the function that describes what a chord is
    'ExplainChords': function() {
        console.log("Explain what a chord is.");

        var message = 'A chord is a group of at least three notes that can be played ' +
            'together and form the harmony. These are typically played with ' +
            'your left hand while your right hand plays the melody. ' +
            'An example is the Chord C Major. It is the C, E, and G notes played together ' +
            'like this.' +
            '<break time="1s"/>' +
            '<audio src=\"' + chordExample + '\" />' +
            '<break time="1s"/>' +
            'These keys are pressed with your pinky, middle finger, and thumb. ' +
            'If you would like to learn how to play a song, say List Songs to get started.';

        this.emit(':ask', message, repromptChordMessage);
    },
    'SessionEndedRequest': function() {
	console.log("Session ended");
	this.emit(':tell', goodbyeMessage);
    },
    // this starts a new note game
    'PlayNoteGame': function() {
	console.log("Play Note Game Requested.");

	// generate random note
	const noteGuess = generateRandomNote().noteGuess;

	var noteGameMessage = "This is a note game. I will play a note on the musical " +
	    "scale, then you can guess which one it is. Please answer in the form of a " +
	    "sentance so I can hear you correct. For example, say That is a D." +
	    "<break time=\"1s\"/>" +
	    "<say-as interpret-as=\"interjection\">good luck!</say-as>" +
	    "<audio src=" + musicNoteFolder + noteGuess + ".mp3\" />";
	var noteGameReminder = "Here is the note once again." +
            "<break time=\"1s\"/>" +
            "<audio src=" + musicNoteFolder + noteGuess + ".mp3\" />" +
	    "Please guess when ready.";

	// save the note to be guessed, and set the string of correct answers to zero.
	this.attributes['GuessNote'] = noteGuess;
	this.attributes['NumberCorrect'] = 0;

	this.emit(':ask', noteGameMessage, noteGameReminder);
    },
    'MusicGuess': function() {
	console.log("Game Guessed");
	const slots    = this.event.request.intent.slots;
	const session  = this.event.session.attributes;
	var numCorrect = session.NumberCorrect;

	// verify that a note has been generated
	if (!session.GuessNote) {
	    console.log("Game not in session.")
	}

	// sometimes Alexa appends a period after the letter - remove if that is the case.
        var note = slots.MusicNotes.value;
    	if (note[1]==".") {
            note = note[0];
    	}

	var accidental = "";
	if (slots.MusicAccidental) {
	    accidental = slots.MusicAccidental.value; 	
	}

	// replay the original note, then determine if answer was correct
	var musicGuessMessage = "Here was the note I played" +
	    "<audio src=" + musicNoteFolder + session.GuessNote + ".mp3\" />" +
	    "You guessed "; 
	if (note) {
	    musicGuessMessage = musicGuessMessage + note + ". ";
            if (session.GuessNote.toLowerCase() === note.toLowerCase()) {
		console.log("User Guessed Correct: " + note);
		numCorrect += 1;
		musicGuessMessage = musicGuessMessage + "You are correct! " +
		    "That makes " + numCorrect + " in a row. " +
            	    "<say-as interpret-as=\"interjection\">way to go!</say-as>";
		this.attributes['NumberCorrect'] = numCorrect;
	    } else {
		console.log("User Guessed Incorrect: " + note + " Correct Answer: " + 
		    session.GuessNote);
		musicGuessMessage = musicGuessMessage +
            	    "<say-as interpret-as=\"interjection\">aw man</say-as>" + 
		    "Sorry, the correct answer is " +
		    session.GuessNote.toLowerCase() + ". ";
		this.attributes['NumberCorrect'] = 0;
	    }
	}

        // generate the next question and save for the next round
        const noteGuess = generateRandomNote().noteGuess;
        this.attributes['GuessNote'] = noteGuess;

	musicGuessMessage = musicGuessMessage + "Let's try another round. " +
	    "Here is the next note." +
            "<break time=\"1s\"/>" +
            "<audio src=" + musicNoteFolder + noteGuess + ".mp3\" />";
	var musicReminderMessage = "Here is the next note to guess. " +
            "<break time=\"1s\"/>" +
            "<audio src=" + musicNoteFolder + noteGuess + ".mp3\" />";

	this.emit(':ask', musicGuessMessage, musicReminderMessage);
    },
    'Unhandled': function () {
    	console.log("Unhandled event");
        console.log(JSON.stringify(this.event));
        this.emit(':ask', unhandledMessage, unhandledMessage);
    }
});

// this function generates a random musical note
function generateRandomNote() {
    var noteGuess = "";

    const note = Math.floor(Math.random() * 7);

    if (note > 6) {
        noteGuess = "g";
    } else if (note > 5) {
        noteGuess = "f";
    } else if (note > 4) {
        noteGuess = "e";
    } else if (note > 3) {
        noteGuess = "d";
    } else if (note > 2) {
        noteGuess = "c";
    } else if (note > 1) {
        noteGuess = "b";
    } else {
        noteGuess = "a";
    }

    return {
	noteGuess
    };
}
