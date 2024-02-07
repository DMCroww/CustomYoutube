function processLink(obj) {
	let url = obj.value
	if (url !== lastUrl) {
		let id = false
		if (/\/watch\?v=/.test(url))
			id = url.split('=')[1].split('&')[0]
		else if (/youtu\.be\//.test(url))
			id = url.split('.be/')[1].split('?')[0]
		if (id) addId(id)
		lastUrl = url
	}
	obj.value = ''
}

function addId(id) {
	if (IDs.includes(id)) return echo("Already in list.", "error")
	IDs.push(id)
	saveIDs()
	echo(`Added ID: ${id}`, "confirm")
	if (!playing) playing = playVid(IDs[0])
	listEl.innerHTML = ''
	IDs.forEach(id => listEl.innerHTML += `<a href='https://youtu.be/${id}' target='_blank'>${id}</a>`)
}
function playVid(id) {
	try {
		if (!player) player = new YT.Player('player', {
			width: 1920,
			height: 1080,
			videoId: id,
			events: {
				'onStateChange': (event) => {
					let state = event.data
					if (state == 0) nextVid()
					else if (state == 1 || state == 2) {
						const { isLive, title, author, video_id } = event.target.getVideoData()
						let remaining = event.target.getDuration() - event.target.getCurrentTime()

						send({ state, isLive, title, author, video_id, remaining }, "ytbData")
					}
				},
				'onReady': (event) => {
					event.target.playVideo()
				}
			},
			playerVars: { controls: 1, kb: 1, fs: 0, modestbranding: 1, rel: 0, },
		})
		else player.loadVideoById(id)
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

function nextVid() {
	IDs.shift()
	saveIDs()
	if (IDs.length) {
		playing = playVid(IDs[0])
	} else {
		playing = false
		send(true, "end")
	}
	listEl.innerHTML = ''
	IDs.forEach(id => listEl.innerHTML += `<a href='https://youtu.be/${id}' target='_blank'>${id}</a>`)
}

function saveIDs() {
	window.localStorage.setItem("IDs", JSON.stringify(IDs))
}