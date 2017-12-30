# Piano Player Skill

Learn how to play the piano using this Alexa skill. With the Echo Show, it can play videos showing the individual keys to be played for songs on the piano.

![](/logos/logo108x108.png)

**Architecture**

**Table of Contents**
- [How do you play a video within an Alexa skill?](#play-video-custom-skill)
- [How do you render a visual list of songs?](#create-video-list)
- [Where are the songs cataloged?](#data-in-song-list)
- [What event gets created when touching the Echo screen?](#event-triggered-by-touching-echo)
- [How did you create the videos with keys labeled?](#how-to-create-videos-with-camtasia)

## Play Video Custom Skill

Playing videos within the Echo show requires using the Video App Directives.
Start by setting the Video App filed to yes on the Skill Information tab within the Developer Console. It should look like this.

![](https://s3.amazonaws.com/pianoplayerskill/logos/setVideoDirective.png)

Then within the Lambda function, execute the following logic using the current NodeJS SDK.

```sh
# const videoClip = 'https://locationOfVideo.mp4'

this.response.playVideo(videoClip);
```

## Create Video List

## Data in Song List

## Event Triggered by Touching Echo

## How to Create Videos with Camtasia
