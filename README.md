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

For reference, here is what the 

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

## Data in Song List

## Event Triggered by Touching Echo

## How to Create Videos with Camtasia

## Lambda Deployment Process
