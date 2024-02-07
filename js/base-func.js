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