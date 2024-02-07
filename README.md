# CustomYoutube
Custom youtube embed player that has several bonus features like DiscordRPC, clipboard monitoring, queue autopaste, autoplay and more. Some of theese require a local Node.js script to be run on your machine. 

## Features:

- Monitors Clipboard and automatically adds copied YouTube links to a list of videos "to be played"
- Autoplays queued videos (can be disabled in "queue" list)
- Saves list of unplayed videos for you so you can get right back where you were before leaving
- Saves current video progress (requires 3rd party cookies to be enabled)
- Discord RPC integration - Shows what you're watching (can be disabled in settings)

## Limitations:

- The [CustomPlayer website](https://ytb.dmcroww.tech) uses Youtube Embed Player, so some videos might not be able to be played (this is up to the creator to decide)
- For same reason, no Ads will play as Google can't guarantee the validity of the advertisement to the advertisers.
- Age restricted videos will not play either unless 3rd party cookies are enabled. That *might* solve this issue, as it allows the player to check for the account you're currently logged in on Youtube.com. You can check if it worked by right-clicking the player > "Account"
- Some users also reported that some AdBlocking extensions *might* block traffic to google. If the site doesn't work, try disabling your AdBlock for the player's site (ads should not play either way)

## Automated mode (local script) Installation:

*Make sure you have Node.js installed and up-to-date*
1) Clone the repo.
2) Install dependencies using `npm i`
3) Run script using `node ./customYTB.js`

## Usage:

1) Open the [custom player](https://ytb.dmcroww.tech) in your browser

2) Go to [Youtube](https://youtube.com) and **copy a video link**
   - Right click on video > *Copy link adress*, or click the three dots > *Share* > *Copy link*. 
   - **Manual mode**:
      - On the Player page, paste your link in the input field at the top of the queue list (left side of screen).
   - **Automated mode**:
	  - Local script will recognize the link, and send it through WebSocket to the player. 
      - If sounds are enabled in settings, you should hear a *ding* sound after copying the link. 
      - You can keep adding more videos. They'll be put in a queue.
      - Duplicate videos won't be added.

3) Video should be added
   - If the link was valid, there should be a new entry in the queue list.
   - If the queue list was empty and **autoplay** is enabled, the player will play the video right away.

4) Enjoy YouTube without being blocked or slowed down for using AdBlock.

5) *optional* Enable 3rd party cookies
   
   For enhanced features like history and playback resuming, enable 3rd party cookies if you have them disabled.
