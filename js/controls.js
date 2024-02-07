function toggleFS() {
	if (document.fullscreen) document.exitFullscreen()
	else document.body.requestFullscreen()
}

function saveSettings(close) {
	if (wsFails == 0) {
		settings.rpcOn = opts[1].checked
		settings.rpcIdle = opts[2].checked
		settings.rpcIdleTo = parseFloat(opts[3].value)
		settings.soundEnabled = opts[4].checked
		settings.soundVol = parseFloat(opts[5].value)
		settings.poll = parseFloat(opts[6].value) * 1000
		soundsEl.forEach(e => e.volume = settings.soundVol)
		window.localStorage.setItem("settings", JSON.stringify(settings))
		setMode(opts[0].checked ? "auto" : "manual")
		send(settings, "settings")
		if (close) settingsEl.className = ''
		echo("Settings saved.", "confirm")
	} else {
		echo("Settings not saved. WebSocket disconnected.", "error")
	}
}
function setMode(mode) {
	settings.mode = mode
	connectEl.className = ''
	modes[mode]()
}
const modes = {
	manual: () => {
		if (socket) {
			socket.onclose = (event) => { }
			socket.close()
			socket = false
		}
		manualEl.className = ''
		manualEl.querySelector('input').focus()
		opts[0].checked = false

		setTimeout(() => {
			if (IDs.length && !playing) {
				playing = true
				playVid(IDs[0])
			}
		}, 100)
	},
	auto: () => {
		manualEl.className = 'disabled'
		opts[0].checked = true
		if (!socket) connect()
	}
}