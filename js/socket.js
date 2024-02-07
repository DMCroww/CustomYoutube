function send(data, type = "command") {
	if (socket && settings.mode == 'auto') {
		if (socket.OPEN) return socket.send(JSON.stringify({ type, data }))
		setTimeout(() => { send(data, type) }, 1000)
	}
}

function connect() {
	socket = new WebSocket('ws://localhost/')
	socket.onopen = () => {
		echo("WebSocket connected.")
		setTimeout(() => {
			if (IDs.length && !playing && settings.autoplay) {
				playing = true
				playVid(IDs[0])
			}
		}, 1000)
		wsFails = 0
		send(true, "keepalive")
		interval = setInterval(() => {
			send(true, "keepalive")
		}, 60000)
		send(settings, "settings")
	}
	socket.onmessage = (event) => {
		let { data, type } = JSON.parse(event.data)
		if (type == "echo") echo(data[0], data[1])
		if (type == "id") addId(data)
		if (type == "verCheck" && data != currVer) oldVer()
	}

	socket.onclose = (event) => {
		clearInterval(interval)
		if (settings.mode == 'auto') setTimeout(connect, 2000)
		if (wsFails % 3 == 0)
			echo("Local script not running. Do you have it?", "warn")

		wsFails++
	}
}