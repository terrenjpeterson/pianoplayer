# Piano Player Skill

Learn how to play the piano using this Alexa skill. With the Echo Show, it can play videos showing the individual keys to be played for songs on the piano.

![](/logos/logo108x108.png)

**Architecture**

**Table of Contents**
- [How do you play a video within an Alexa skill?](#play-video-custom-skill)
- [What are the video controls?](#echo-show-video-controls)
- [How do you know if the request is coming from an Echo Show?](#recognize-skill-requestor)
- [How do you render a visual list of songs?](#create-video-list)
- [Where are the songs cataloged?](#data-in-song-list)
- [What event gets created when touching the Echo screen?](#event-triggered-by-touching-echo)
- [How did you create the videos with keys labeled?](#how-to-create-videos-with-camtasia)
- [How do you deploy changes to the skill from the command line?](#lambda-deployment-process)

## Play Video Custom Skill

Playing videos within the Echo show requires using the Video App Directives.
Start by setting the Video App filed to yes on the Skill Information tab within the Developer Console. It should look like this.

![](https://s3.amazonaws.com/pianoplayerskill/logos/setVideoDirective.png)

Then within the Lambda function, execute the following logic using the current NodeJS SDK.

```sh
# const videoClip = 'https://locationOfVideo.mp4'

this.response.playVideo(videoClip);
```

Transfer then controls over to the video player, and then the user can control the video playback directly.

## Echo Show Video Controls

When playing a video, the user can pause, rewind, fast-forward, etc. on the video file that is being played.
This can be done through voice commands, or by touching the Echo Screen.
Please note: these commands do not trigger events that invoke your skill. Rather the device handles them directly with the video file.
This ensures a consistent user experience across skills, or the native video experience on the device.

## Recognize Skill Requestor

It's important to only play back videos to devices that have a screen. 
If a video file is passed back to a audio-only Alexa enabled device, the response will be marked in error, and the skill will terminate.
For this skill, there is logic that leverages the ability of the Alexa SDK to detect if the device has a video player.
Here is a sample of code that determines if one is present. The first line detects for a Video player enabled device.

```sh
// If the device is able to play video pass video, else audio
if (this.event.context.System.device.supportedInterfaces.VideoApp) {
    const videoClip = videoLoc + 'DownScale.mp4';
    const metadata = {
    	'title': 'Reverse Note Drill'
    };
    console.log("Invoked from video playing device");
    this.response.playVideo(videoClip, metadata);
} else {
    console.log("Playing from non-video device");
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
}
```

## Create Video List

The video list comes from one of the visual templates, ListTemplate1.
The data for all of the songs is stored in a local array, and for each.
Here is the piece of code within the ListSongs function that builds the Template.

```sh
const itemImage = null; // note there is no image currently in the list
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
this.response.speak(message).listen(noSongRepeatMessage).renderTemplate(listTemplate);
this.emit(':responseReady');
```

For reference, here is what the list object ends up looking like.
The list does not currently have an image, but it does have both primary and secondary text.

```sh
{
    "type": "ListTemplate1",
    "token": "listToken",
    "title": "Available Song List",
    "listItems": [
        {
            "image": null,
            "token": "song001",
            "textContent": {
                "primaryText": {
                    "text": "Silent Night",
                    "type": "PlainText"
                },
                "secondaryText": {
                    "text": "Moderate",
                    "type": "PlainText"
                }
            }
        },
        {
            "image": null,
            "token": "song002",
            "textContent": {
                "primaryText": {
                    "text": "Mary Had a Little Lamb",
                    "type": "PlainText"
                },
                "secondaryText": {
                    "text": "Easy",
                    "type": "PlainText"
                }
            }
        },
	...
    ],
    "backgroundImage": {
        "sources": [
            {
                "url": "https://s3.amazonaws.com/pianoplayerskill/logos/pianoStrings.jpg"
            }
        ]
    }
}
```

Each item in the list also is identified with a unique token.
This token is passed back to the skill if one of the songs of the list is selected by the touch screen on the Echo Show.

## Data in Song List

All of the current songs that this skill can play are stored in the [songs.json](https://github.com/terrenjpeterson/pianoplayer/blob/master/songs.json) file.
This file is read into a local array, then referenced within various functions of the skill.
There is a boolean named listSong that determines if the song name should be read during a listing of the skills.
This is because there are duplicate entries in the array for multiple names that may be uttered by the user when trying to request a song.

Here is a sample of the data
```sh
[
	{
		"requestName": "Silent Night",
		"listSong":true,
		"token":"song001",
		"difficulty":"Moderate",
		"videoObject": "SilentNight.mp4",
		"audioObject": "SilentNight.mp3"
	},
	{
		"requestName": "Mary Had a Little Lamb",
                "listSong":true,
                "token":"song002",
                "difficulty":"Easy",
		"videoObject": "MaryHadLittleLamb.mp4",
		"audioObject": "MaryHadLittleLamb.mp3"
	},
	...
```

## Event Triggered by Touching Echo

When a list template is used, the screen on the device has the ability to invoke the skill based on a touch event.
This is the 'ElementSelected' event. The event passes in the token from the list under the attribute this.event.request.token.
The function then matches the token value with the array of songs, and plays the video for the user.
There is no audio equivalent to this feature as there is nothing to 'touch' on a standard Alexa device.

## How to Create Videos with Camtasia

Much of the effort in building this skill was around creating the content for each song.
We recorded the piano music we played using a mobile phone, as well as took pictures of the keys and other parts of the piano for use as backgrounds.
Within Camtasia, there is a process of building layers of different items of media, then assembling.
Here is a screenshot of Camtasia that highlights this.

![](https://s3.amazonaws.com/pianoplayerskill/logos/camtasia.png)

In making the videos, the base layer is a photograph. By bringing in the audio from playing the piano, we get a timeline that shows each note being played in the mp3 file.
By the curve within the wave, we can tell when each note on the piano is struck, so we add another layer that highlights which note is being played.
If there are multiple notes being played at once, then there are multiple images.
When complete, Camtasia builds an mp4 file that is in a compatible format for playing on an Echo Show.
We also create an mp3 file that can be used for non-video devices that use the skill.

## Lambda Deployment Process

When developing this skill, I've used an IDE and a local copy of the GitHub repo.
When I'm ready to test out the skill, I execute the [build.sh](https://github.com/terrenjpeterson/pianoplayer/blob/master/build.sh) script.
This script has multiple steps.

1. Create a local build package by zipping up the source code, songs.json file, and npm binaries.
2. Stage the zipped file into a s3 bucket.
3. Update the function code for the appropriate (Green/Blue) version of the skill. Which one depends on if I am updating the local test version or the one currently in production.
4. Test the lambda function by invoking using locally managed test data.

