
function echo(data, sound = false) {
	echoEl.innerText = data
	echoEl.classList.toggle("show", true)
	setTimeout(() => { echoEl.classList.toggle("show", false) }, 100)
	if (sound && settings.soundEnabled) soundEl.querySelector(`#${sound}`).play()
}
function setCookie(name, value, days) {
	const expires = new Date()
	expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
	const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
	document.cookie = cookie
}

function getCookie(name) {
	const cookies = document.cookie.split('; ')
	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split('=')
		if (cookieName === name) {
			return cookieValue
		}
	}
	return null
}

function checkProp(obj, properties) {
	for (const property of properties) {
		if (!obj.hasOwnProperty(property)) {
			return false
		}
	}
	return true
}
function oldVer() {
	echo("Your script version is outdated! Please update it!", "warn")
	setTimeout(() => {
		echo("Switching to manual mode.")
	}, 5000)
	controlsEl.className = 'show'
	setTimeout(() => { controlsEl.className = '' }, 5000)
	modes.manual()
}

function updateQueueList() {
	listEl.innerHTML = '<p>Queued IDs:</p>'
	IDs.forEach(id => listEl.innerHTML += `<button onclick="force(${id})">${id}</button>`)
}

function showRemoteIp(ip = "-.-.-.-") {
	opts[8].value = ip
}

const echoEl = document.querySelector('#echo')
const helpEl = document.querySelector('#help')
const soundEl = document.querySelector('#sounds')
const soundsEl = document.querySelectorAll('audio')
const settingsEl = document.querySelector('#settings')
const scriptOptEl = document.querySelector('#scriptOpt')
const controlsEl = document.querySelector("#controls")
const connectEl = document.querySelector("#connect")
const queueEl = document.querySelector("#queue")
const manualEl = document.querySelector("#manual")
const listEl = document.querySelector("#list")
const inputs = settingsEl.querySelectorAll('input')
const opts = {}
inputs.forEach(i => { opts[i.id] = i })

let currVer = "1.7"
let IDs = JSON.parse(window.localStorage.getItem('IDs') || "[]")
let settings = JSON.parse(window.localStorage.getItem('settings') || "{}")

const required = ['rpcOn', 'rpcIdle', 'rpcIdleTo', 'poll', 'soundEnabled', 'soundVol', 'mode', 'autoplay', 'remote']
if (!checkProp(settings, required)) {
	settings = {
		rpcOn: false,
		rpcIdle: true,
		rpcIdleTo: 5,
		poll: 500,
		soundEnabled: true,
		soundVol: 0.3,
		mode: "manual",
		autoplay: true,
		remote: true
	}
	echo("Settings corrupt. Loaded defaults.")
	window.localStorage.setItem("settings", JSON.stringify(settings))
}

opts.rpc.checked = settings.rpcOn
opts.rpcIdle.checked = settings.rpcIdle
opts.rpcIdleTo.value = settings.rpcIdleTo
opts.sounds.checked = settings.soundEnabled
opts.vol.value = settings.soundVol
opts.clip.value = settings.poll / 1000
opts.remote.checked = settings.remote

queueEl.querySelector('input').value = settings.autoplay

settingsEl.querySelector('#volVal').innerText = (settings.soundVol * 100) + "%"

soundsEl.forEach(e => e.volume = settings.soundVol)


updateQueueList()

let playing = false

let lastUrl = ''

setTimeout(() => { controlsEl.className = '' }, 5000)







let keepaliveInterval
let wsFails = 0
let socketClientId = "player"
function onWsMessage(event) {
	let { id, data, type } = JSON.parse(event.data)
	switch (type) {
		case "ip": return showRemoteIp(data)

		case "id": return addId(data)

		case "echo": return echo(data[0], data[1])

		case "verCheck": return data != currVer ? oldVer() : ""

		case "command": // remote controls
			switch (data) {
				case 'play-pause':
					player.
						break;

				default:
					break;
			}
	}
	// https://www.youtube.com/watch?v=GlPREQ55kzc
}
function onWsOpen() {
	echo("WebSocket connected.")
	setTimeout(() => {
		if (IDs.length && !playing && settings.autoplay)
			playing = playVid(IDs[0])
	}, 500)
	wsFails = 0
	keepaliveInterval = setInterval(() => {
		send("server", socketClientId, true, "keepalive")
	}, 60000)
	send("server", socketClientId, settings, "settings")
}
function onWsClose() {
	clearInterval(keepaliveInterval)
	wsFails++
	if (settings.mode == 'auto') {
		if (wsFails % 4 != 0)
			setTimeout(connect, 5000)
		else
			echo("Local script not running. Do you have it?", "warn")
	}
}