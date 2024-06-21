function toggleFS() {
	if (document.fullscreen) document.exitFullscreen()
	else document.body.requestFullscreen()
}

function saveSettings(close, sound = true) {
	if (wsFails == 0) {
		settings.mode = opts.mode.checked ? "auto" : "manual"
		settings.rpcOn = opts.rpcOn.checked
		settings.rpcIdle = opts.rpcIdle.checked
		settings.rpcIdleTo = parseFloat(opts.rpcIdleTo.value)
		settings.soundEnabled = opts.sounds.checked
		settings.soundVol = parseFloat(opts.vol.value)
		settings.poll = parseFloat(opts.poll.value) * 1000
		settings.remote = opts.remote.checked

		soundsEl.forEach(e => e.volume = settings.soundVol)
		window.localStorage.setItem("settings", JSON.stringify(settings))
		setMode(settings.mode)
		send("server", socketClientId, settings, "settings")
		if (close) settingsEl.className = ''
		echo("Settings saved.", sound ? "confirm" : false)
	} else {
		echo("Settings not saved. WebSocket disconnected.", "error")
	}
}

function setMode(mode) {
	connectEl.className = ''
	modes[mode]()
}

function toggleAutoplay(el) {
	settings.autoplay = el.checked
	saveSettings(true, false)
}

const modes = {
	manual: () => {
		scriptOptEl.className = 'hide'
		updateQueueList()
		if (socket) {
			socket.onclose = (event) => { }
			socket.close()
			socket = false
		}
		manualEl.className = ''
		manualEl.querySelector('input').focus()
		opts.mode.checked = false

		setTimeout(() => {
			if (IDs.length && !playing) {
				if (!player) setPlayer()
				playing = true
				playVid(IDs[0])
			}
		}, 100)
	},
	auto: () => {
		updateQueueList()
		manualEl.className = 'disabled'
		scriptOptEl.className = ''
		opts.mode.checked = true
		if (!socket) connect()
	}
}
