// REQUIRES #region
console.clear()
const clipboardy = require('node-clipboardy')
const WebSocket = require("ws")
const DiscordRPC = require('discord-rpc')
// #end
// VARS #region
let client = false

let lastClip = ""
let pollRunning = false
let pollTimeoutId
let idleTimeoutId
let currVer = "1.5"

let opt = { poll: 2000, rpcOn: true, rpcIdle: true, rpcIdleTo: 5 }
// #end

// SERVER #region

const wsServ = new WebSocket.Server({ port: 80, pingTimeout: 10000, pingInterval: 5000 })
wsServ.on("connection", (ws) => {
	client = ws
	console.log("Player connected.")
	ws.on("message", message => {
		client = ws
		processMessage(message)
	})
	ws.on('close', () => {
		client = false
		rpc.clearActivity()
		clearTimeout(pollTimeoutId)
		clearTimeout(idleTimeoutId)
	})
	send(currVer, "verCheck")
})
// #end

// DISCORD RPC #region
const clientId = "1088721467803443211"
try { DiscordRPC.register(clientId) }
catch (e) { console.error(e) }

const activityBase = {
	state: 'Player ready.',
	largeImageKey: 'customyoutube',
	largeImageText: 'Youtube on https://dmcroww.live/ytb/',
	smallImageKey: 'idle',
	smallImageText: 'Idle',
	buttons: [{ label: "Try Croww's player", url: "https://dmcroww.live/ytb/" }]
}
let lastActivity = { ...activityBase }
const rpc = new DiscordRPC.Client({ transport: 'ipc' })
rpc.on('ready', () => {
	console.log('Connected to Discord.')
	if (opt.rpcOn) rpc.setActivity(activityBase)
})
rpc.login({ clientId }).catch(console.error)

// #end

// MAIN FUNCTIONS #region
function send(data, type = "data") {
	if (client) client.send(JSON.stringify({ type, data }))
}
function processMessage(message) {
	try {
		let { type, data } = JSON.parse(message)
		if (type == "settings") {
			opt = { ...opt, ...data }
			if (!opt.rpcOn) rpc.clearActivity()
			else rpc.setActivity(lastActivity)
			if (opt.poll && !pollRunning) {
				console.log("Clipboard checking ON")
				monitorClipboard()
			} else {
				console.log("Clipboard checking Running of off")
			}
		}
		if (type == "ytbData") {
			const { isLive, state, title, author, remaining, id } = data
			const paused = state == 2
			const activity = { ...activityBase }
			activity.smallImageKey = paused ? "pause" : "play"
			activity.smallImageText = paused ? "Paused" : "Playing"
			activity.details = `Watching ${author}${isLive ? "'s livestream" : ''}` || '=author missing='
			activity.state = title || '=title missing='
			if (!paused) activity.endTimestamp = Math.floor((Date.now() / 1000) + remaining)
			activity.buttons = [{ label: "Watch on YouTube", url: `https://youtu.be/${id}` }, ...activity.buttons]
			lastActivity = { ...activity }
			if (opt.rpcOn) {
				rpc.setActivity(activity)
				if (paused && opt.rpcIdle)
					idleTimeoutId = setTimeout(() => {
						rpc.setActivity({
							...activityBase,
							details: 'Player paused.',
							state: 'Idle. Fell asleep?'
						})
					}, (opt.rpcIdleTo * 60 * 1000) + 1)
				else clearTimeout(idleTimeoutId)
			} else rpc.clearActivity()
		}
		if (type == "end" && opt.rpcOn)
			rpc.setActivity({ ...activityBase, state: 'Player queue empty.' })

	} catch (e) { console.error(e) }
}



function monitorClipboard() {
	try {
		const clip = clipboardy.readSync()
		// console.log(clip)
		if (clip != lastClip) {
			lastClip = clip
			let id = false

			if (/\/watch\?v=/.test(clip))
				id = clip.split('=')[1].split('&')[0]
			else if (/youtu\.be\//.test(clip))
				id = clip.split('.be/')[1].split('?')[0]

			if (!id) return

			console.log('Detected YouTube ID: ' + id)
			send(id, "id")
		}
		if (opt.poll) pollTimeoutId = setTimeout(monitorClipboard, opt.poll)
		else pollRunning = false
	} catch (e) {
		clip = false
		lastClip = clip
		pollTimeoutId = setTimeout(monitorClipboard, opt.poll)
		console.error(e)
	}
}
// #end