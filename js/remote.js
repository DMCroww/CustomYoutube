
function onWsMessage(event) {
	let { id, data, type } = JSON.parse(event.data)

	if (type == "id") return addId(data)
	if (id == "server") {
		if (type == "echo") echo(data[0], data[1])
		if (type == "verCheck" && data != currVer) oldVer()
	}
	if (id == "remote") {

	}
}
function onWsOpen() {
	echo("WebSocket connected.")
	setTimeout(() => {
		if (IDs.length && !playing && settings.autoplay) {
			playing = true
			playVid(IDs[0])
		}
	}, 1000)
	wsFails = 0
	keepaliveInterval = setInterval(() => {
		send("server", id, true, "keepalive")
	}, 60000)
	send("server", id, settings, "settings")
}
function onWsClose() {
	clearInterval(keepaliveInterval)
	if (settings.mode == 'auto') setTimeout(connect, 5000)
	if (wsFails % 3 == 0)
		echo("Local script not running. Do you have it?", "warn")

	wsFails++
}