let socket

function send(to, id, data, type = "command") {
	if (socket && settings.mode == 'auto') {
		if (socket.OPEN)
			socket.send(JSON.stringify({ to, id, type, data }))
		else if (socket.CONNECTING)
			setTimeout(() => { send(data, type) }, 1000)
	} else if (settings.mode == 'auto')
		setTimeout(() => { send(data, type) }, 1000)
}

function connect(id, ip = "localhost") {
	socket = new WebSocket(`ws://${ip}/`)
	socket.onopen = (event) => onWsOpen(event)
	socket.onmessage = (event) => onWsMessage(event)
	socket.onclose = (event) => onWsClose(event)
}