const divEl = document.querySelector('#ytb')
const echoEl = document.querySelector('#echo')
const helpEl = document.querySelector('#help')
const soundEl = document.querySelector('#sounds')
const soundsEl = document.querySelectorAll('audio')
const settingsEl = document.querySelector('#settings')
const controlsEl = document.querySelector("#controls")
const connectEl = document.querySelector("#connect")
const manualEl = document.querySelector("#manual")
const listEl = document.querySelector("#list")
const opts = settingsEl.querySelectorAll('input')


let currVer = "1.5"
let IDs = JSON.parse(window.localStorage.getItem('IDs') || "[]")
let settings = JSON.parse(window.localStorage.getItem('settings') || "{}")

const required = ['rpcOn', 'rpcIdle', 'rpcIdleTo', 'poll', 'soundEnabled', 'soundVol', 'mode']
if (!checkProp(settings, required)) {
	settings = {
		rpcOn: false,
		rpcIdle: true,
		rpcIdleTo: 5,
		poll: 500,
		soundEnabled: true,
		soundVol: 0.3,
		mode: "manual"
	}
	echo("Settings corrupt. Loaded defaults.")
}

opts[1].checked = settings.rpcOn
opts[2].checked = settings.rpcIdle
opts[3].value = settings.rpcIdleTo
opts[4].checked = settings.soundEnabled
opts[5].value = settings.soundVol
opts[6].value = settings.poll / 1000

settingsEl.querySelector('#volVal').innerText = (settings.soundVol * 100) + "%"

soundsEl.forEach(e => e.volume = settings.soundVol)

IDs.forEach(id => listEl.innerHTML += `<a href='https://youtu.be/${id}' target='_blank'>${id}</a>`)

let player = false
let playing = false

let lastUrl = ''

let socket = false
let interval
let wsFails = 0

setTimeout(() => { controlsEl.className = '' }, 5000)


function oldVer() {
	echo("Your script version is outdated! Please update it!", "warn")
	setTimeout(() => {
		echo("Switching to manual mode.")
	}, 5000)
	controlsEl.className = 'show'
	setTimeout(() => { controlsEl.className = '' }, 5000)
	modes.manual()
}