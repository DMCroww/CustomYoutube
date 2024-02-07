function connect() {
	socket = new WebSocket('ws://192.168.1.3:9863')
	socket.onopen = () => {

		timer = setTimeout(() => {
			document.body.classList.remove('show');
		}, 15000);
		socket.send(JSON.stringify({ command: "get", value: true }))
	}
	socket.onmessage = (event) => processData(event.data)
	socket.onclose = () => {
		socket = false
		setTimeout(connect, 5000)
		isPaused = true
	}
	socket.onerror = (e) => console.error(e)
}
function execCmd(el) {
	if (socket) {
		socket.send(JSON.stringify({
			command: el.dataset.command,
			value: (el.type == 'range') ? el.value : true
		}))
		// setTimeout(() => { socket.send(JSON.stringify({ command: "get", value: true })) }, 500)
	}
}
function execCmdString(string) {
	if (socket) {
		socket.send(JSON.stringify({ command: string, value: true }))
	}
}
function changeTheme(el) {
	type = el.dataset.type
	switch (type) {
		case "stay":
			document.body.classList.toggle('force')
			el.classList.toggle('high')
			break;

		case "color":
			document.body.classList.remove(`color${currColIdx}`)
			currColIdx = (currColIdx < 4) ? currColIdx + 1 : 0
			document.body.classList.add(`color${currColIdx}`)
			break;

		case "bright":
			document.body.classList.remove(`bri${currBriIdx}`)
			currBriIdx = (currBriIdx < 4) ? currBriIdx + 1 : 0
			document.body.classList.add(`bri${currBriIdx}`)
			break;

		default:
			break;
	}
}

function processData(json) {
	const { player, track } = JSON.parse(json)

	isPaused = player.isPaused
	durationHuman = track.durationHuman
	progressEl.max = track.duration
	volEl.value = player.volumePercent
	seekbarCurrentPosition = player.seekbarCurrentPosition
	cover = track.cover
	title = limitString(track.title)
	author = limitString(track.author)
}

function update() {
	if (didChange()) {
		bckEl.src = cover
		coverEl.src = cover
		titleEl.innerText = title
		artistEl.innerText = author
		totalEl.innerText = durationHuman

		fadeIn()
	}
	playEl.classList.toggle('high', isPaused)

	if (wasPaused != isPaused) {
		fadeIn()
		wasPaused = isPaused
	}


	elapsedEl.innerText = getHMS(seekbarCurrentPosition)
	progressEl.value = seekbarCurrentPosition

	if (!isPaused) seekbarCurrentPosition++
}

function didChange() {
	const c = (bckEl.src == cover && coverEl.src == cover)
	const t = titleEl.innerText == title
	const a = artistEl.innerText == author
	const d = totalEl.innerText == durationHuman
	return !(c && t && a && d)
}

function getHMS(seconds) {
	let h = Math.floor(seconds / 3600)
	let m = Math.floor((seconds % 3600) / 60).toString()
	let s = (seconds % 60).toString()
	return `${h ? h.toString().padStart(2, '0') + ":" : ""}${h ? m.padStart(2, '0') : m}:${s.padStart(2, '0')}`
}

function limitString(string) {
	let arr = string.replace(/(\(|\[)/gi, "\n$1").replace(/(\)|\])/gi, "$1\n").split(" ")
	let out = ''
	arr.forEach(e => {
		if (out.length + e.length < 50) out += e + " "
		else return out.trim()
	});
	return out.trim().replace(/ ?\n ?/gi, "\n")
}

function fadeIn() {
	clearTimeout(timer)
	clearTimeout(mouseMoveTimer)
	document.body.classList.add('show');
	timer = setTimeout(() => {
		document.body.classList.remove('show');
	}, 15000);
}

function handleMouseMovement() {
	clearTimeout(mouseMoveTimer);
	document.body.classList.remove('unhovered');
	document.body.classList.add('hovered');
	mouseMoveTimer = setTimeout(() => {
		document.body.classList.add('unhovered');
		mouseMoveTimer = setTimeout(() => {
			document.body.classList.remove('hovered');
			document.body.classList.remove('unhovered');
		}, 2000);
	}, 3000);
}

const cursorEl = document.querySelector('#cursor')
const bckEl = document.querySelector('#bck')
const coverEl = document.querySelector('#cover img')
const titleEl = document.querySelector('#title')
const artistEl = document.querySelector('#artist')
const progressEl = document.querySelector('#prog')
const elapsedEl = document.querySelector('#elapsed')
const totalEl = document.querySelector('#total')
const volEl = document.querySelector('#vol')
const playEl = document.querySelector('#playbutt')
const buttons = document.querySelectorAll('.command')
const inputs = document.querySelectorAll('input')

let currColIdx = 0
let currBriIdx = 0

let socket
let timer
let mouseMoveTimer

let isPaused = true
let wasPaused = true
let durationHuman
let duration
let seekbarCurrentPosition

let cover = ''
let title = '...'
let author = '...'

setInterval(update, 1005);


document.addEventListener('mousemove', handleMouseMovement);
document.addEventListener('mousemove', function (e) {
	cursorEl.style.left = (e.pageX || 1) + "px"
	cursorEl.style.top = (e.pageY || 1) + "px"
});
let voiceActive = false
document.querySelectorAll("#themes button").forEach(e => e.onclick = () => { changeTheme(e) })
document.querySelectorAll('.command').forEach(el => el.onclick = () => { execCmd(el) })
document.querySelectorAll('input').forEach(el => el.onclick = () => { execCmd(el) })
document.querySelector("#voiceInput").onclick = () => {
	voiceActive = !voiceActive
	document.querySelector("#voiceInput").classList.toggle('high', voiceActive)
}



connect()
try { navigator.wakeLock.request('screen').catch((error) => { }) }
catch (err) { }

if ('webkitSpeechRecognition' in window) {
	const recognition = new webkitSpeechRecognition();
	// recognition.lang = 'en-US';
	recognition.onend = recognition.start
	recognition.onresult = parseVoice
	recognition.start()
} else
	console.error('Speech recognition not supported in this browser.');

const voiceCommands = {
	"next track": "track-next",
	"next song": "track-next",
	"pause music": "track-pause",
	"music pause": "track-pause",
	"play music": "track-play",
	"music play": "track-play",
	"last track": "track-previous",
	"last song": "track-previous",
	"i really like this song": "track-thumbs-up",
	"i hate this song": "track-thumbs-down"
}

function parseVoice(event) {
	const string = event.results[0][0].transcript.toLowerCase()

	console.log(string)
	if (voiceActive && voiceCommands.hasOwnProperty(string)) {
		execCmdString(voiceCommands[string])
		console.log(" - command:", voiceCommands[string])
	}
}