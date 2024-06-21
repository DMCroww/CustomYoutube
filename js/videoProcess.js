let player

function setPlayer(id) {
	player = new YT.Player('player', {
		width: Math.floor((window.innerHeight / 9) * 16),
		height: Math.floor(window.innerHeight),
		video_id: null,
		events: {
			'onStateChange': playerStateChange,
			'onReady': (event) => { event.target.playVideo() }
		},
		playerVars: { controls: 1, kb: 1, fs: 0, modestbranding: 1, rel: 0, },
	})
}

function playerStateChange(event) {
	switch (event.data) {
		case 0:
			let currentId = event.target.getVideoData().video_id
			IDs = IDs.filter(id => id != currentId)
			if (!settings.autoplay) {
				playing = false
				controlsEl.className = 'show'
				setTimeout(() => { controlsEl.className = '' }, 15000)
			} else nextVid()
			break;

		case 1:
		case 2:
			send("server", {
				...event.target.getVideoData(),
				state: event.data,
				remaining: event.target.getDuration() - event.target.getCurrentTime()
			}, "ytbData")
			break;
	}
}

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
	if (IDs.includes(id))
		return echo("Already in list.", "warn")
	IDs.push(id)
	saveIDs()
	echo(`Added ID: ${id}`, "confirm")
	if (!playing && settings.autoplay) playing = playVid(IDs[0])
	updateQueueList()
}

function playVid(id) {
	if (player) {
		player.loadVideoById(id)
		return true
	} else return setPlayer(id)
}

function nextVid() {
	IDs.shift()
	saveIDs()
	playing = IDs.length ? playVid(IDs[0]) : false
	updateQueueList()
}

function saveIDs() {
	window.localStorage.setItem("IDs", JSON.stringify(IDs))
}
