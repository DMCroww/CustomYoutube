# Custom YouTube Player
Custom youtube embed player that has several bonus features like DiscordRPC, clipboard monitoring, queue autopaste, autoplay and more. Some of theese require a local Node.js script to be run on your machine. 

## Features:

- Monitors Clipboard and automatically adds copied YouTube links to a list of videos "to be played"
- Autoplays queued videos
- Queue autosave
- Saves current video progress (requires 3rd party cookies to be enabled)
- Discord RPC integration - Shows what you're watching
- **(WIP)** [Remote control](#remote-control-info-wip) from LAN devices through web browser

## Limitations:

- The [CustomPlayer website](https://ytb.dmcroww.tech) uses Youtube Embed Player, so some videos might not be able to be played (this is up to the creator to decide)
- For same reason, no Ads will play as Google can't guarantee the validity of the advertisement to the advertisers.
- Age restricted videos will not play either unless 3rd party cookies are enabled. This *might* solve this issue, as it allows the player to check for the account you're currently logged in on Youtube.com. You can check if it worked by right-clicking the player > "Account"
- Some users also reported that some AdBlocking extensions *might* block traffic to google. If the site doesn't work, try disabling your AdBlock for the player's site (ads should not play either way)

## Automated mode (local script) Installation:

***Make sure you have Node.js installed and up-to-date***
1) Download/copy the `customYTB.js` file, or clone the whole repo.
2) Run the script using `node ./customYTB.js`

*(Script should try to install all dependencies on its own, but in case it fails to start up, just run `npm i ws node-clipboardy discord-rpc`)*

## Usage:

**1) Open the [custom player](https://ytb.dmcroww.tech) in your browser**

**2) Go to [Youtube](https://youtube.com) and copy a video link**
   - Right click on video > *Copy link adress*, or click the three dots > *Share* > *Copy link*. 
   - *Manual mode*:
      - On the Player page, paste your link in the input field at the top of the queue list (left side of screen).
   - *Automated mode*:
	  - Local script will recognize the link, and send it through WebSocket to the player. 
      - If sounds are enabled in settings, you should hear a *ding* sound after copying the link. 

**3) Video should be added**
   - If the link was valid, there should be a new entry in the queue list.
   - If the queue list was empty and **autoplay** is enabled, the player will play the video right away.
   - You can keep adding more videos. They'll be put in a queue.
   - Duplicate videos won't be added.

**4) Enjoy YouTube without being blocked or slowed down for using AdBlock.**

**5) *(optional)* Enable 3rd party cookies**
   - For enhanced features like history and playback resuming, enable 3rd party cookies if you have them disabled.


## Remote control info (WIP):

- You **NEED** the local script to use this! (see [above](#automated-mode-local-script-installation) how to install)
- Controls are hosted on [https://ytb.dmcroww.tech/remote](https://ytb.dmcroww.tech/remote) for easy access
- Remote control is disabled by default in the player settings

## RC setup:

0) Make sure your local script is active

1) Switch to "Automated mode" if not active already

2) Enable "Remote control" option, IP adress should show up below it

3) Navigate to the remote website on your desired device ( [https://ytb.dmcroww.tech/remote](https://ytb.dmcroww.tech/remote) )

4) Enter the IP adress shown on the player settings into the provided input field on your "remote" device

5) Click/tap "Connect" button, on success, player controls should show up

6) Enjoy remote control.