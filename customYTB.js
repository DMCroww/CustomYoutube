// REQUIRES #region
console.clear()
const { spawnSync } = require('child_process');

// Function to fetch a library if it doesn't exist
function getLibrary(library) {
	try {
		return require(library);
	} catch (error) {
		const installProcess = spawnSync("cmd.exe", ['/d', '/s', '/c', 'npm', 'i', library], { stdio: 'ignore' })
		if (installProcess.status === 0) {
			console.log(`'${library}' installed successfully.`);
			// Retry requiring the library
			try {
				return require(library);
			} catch (error) {
				console.error(`Failed to initialize '${library}'. Please try restarting the script.`);
			}
		} else console.error(`Failed to install '${library}'.`);
		process.exit(1);
	}
}

const clipboardy = getLibrary('node-clipboardy');
const WebSocket = getLibrary('ws');
const DiscordRPC = getLibrary('discord-rpc');

// #end

// VARS #region
let client = false

let lastClip = ""
let pollRunning = false
let pollTimeoutId
let idleTimeoutId
let currVer = "1.6"

let opt = { poll: 2000, rpcOn: true, rpcIdle: true, rpcIdleTimeout: 5 }
// #end

// SERVER #region

const wsServ = new WebSocket.Server({ port: 80, pingTimeout: 100000, pingInterval: 30000 })
wsServ.on("connection", (ws) => {
	client = ws
	console.log("Player connected.")
	ws.on("message", message => {
		client = ws
		try {
			let { type, data } = JSON.parse(message)
			if (wsFunctions[type]) wsFunctions[type](data)
		} catch (e) { console.error(e) }
	})
	ws.on('close', () => {
		client = false
		rpc.clearActivity()
		clearTimeout(pollTimeoutId)
		clearTimeout(idleTimeoutId)
	})
	send(currVer, "verCheck")
})

const wsFunctions = {
	settings: (data) => {
		opt = { ...opt, ...data }
		console.log(opt)
		if (opt.rpcOn) rpc.setActivity(lastActivity)
		else rpc.clearActivity()

		if (opt.poll > 0) {
			console.log("Clipboard checking ON")
			if (!pollRunning) monitorClipboard()
		} else {
			console.log("Clipboard checking OFF")
		}
	},
	ytbData: (data) => {
		const { isLive: isLivestream, state: playerState, title, author, remaining, id } = data
		const paused = playerState == 2
		const activity = {
			...activityBase,
			smallImageKey: paused ? "pause" : "play",
			smallImageText: paused ? "Paused" : "Playing",
			details: `Watching ${author}'s ${isLivestream ? "livestream" : "video"}` || '=author missing=',
			state: title || '=title missing=',
		}
		activity.buttons = [{ label: "Watch on YouTube.com", url: `https://youtu.be/${id}` }, ...activityBase.buttons]
		if (!paused) activity.endTimestamp = Math.floor((Date.now() / 1000) + remaining)
		lastActivity = activity
		if (opt.rpcOn) {
			rpc.setActivity(activity)
			if (paused && opt.rpcIdle)
				idleTimeoutId = setTimeout(() => {
					rpc.setActivity({
						...activityBase,
						state: 'Player paused.',
						details: 'Idle. Fell asleep?'
					})
				}, (opt.rpcIdleTimeout * 60 * 1000) + 1)
			else clearTimeout(idleTimeoutId)
		} else rpc.clearActivity()
	},
	end: () => {
		if (opt.rpcOn) {
			rpc.setActivity({ ...activityBase, state: 'Player queue empty.' })
			if (opt.rpcIdle) {
				clearTimeout(idleTimeoutId)
				idleTimeoutId = setTimeout(() => { rpc.clearActivity() }, (opt.rpcIdleTimeout * 60 * 1000) + 1)
			}
		} else rpc.clearActivity()
	}
}

// #end

// DISCORD RPC #region
const clientId = "1096792159031664670"
try { DiscordRPC.register(clientId) }
catch (e) { console.error(e) }

const activityBase = {
	state: 'Player ready.',
	largeImageKey: 'customyoutube',
	largeImageText: 'Youtube Player on https://ytb.dmcroww.tech',
	smallImageKey: 'idle',
	smallImageText: 'Idle',
	buttons: [{ label: "Try Croww's player", url: "https://ytb.dmcroww.tech/" }]
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

function monitorClipboard() {
	clipboardy.read().then(copiedData => {
		if (copiedData != lastClip) {
			lastClip = copiedData
			let id = ""

			if (copiedData.includes("youtube.com") && copiedData.includes("v="))
				id = copiedData.split('v=')[1].split('&')[0]
			else if (copiedData.includes("youtu.be/"))
				id = copiedData.split('.be/')[1].split('?')[0]

			if (!id) return

			console.log('Detected YouTube ID: ' + id)
			send(id, "id")
		}
		if (opt.poll > 0) pollTimeoutId = setTimeout(monitorClipboard, opt.poll)
		else pollRunning = false
	}).catch(e => {
		lastClip = ""
		pollTimeoutId = setTimeout(monitorClipboard, opt.poll)
		console.error(e)
	})
}
// #end
