function get (el) {
	if (typeof el == 'string') {
		return document.getElementById(el);
	}
	return el;
}

var lastval;

setInterval(function(){
	var pos = get('slider').value * -1;
	
	if (lastval !== pos) {
		lastval = pos;
		get('live').innerText = pos;
		fetch('/control?pos=' + pos).then(res => {});
	}
},20);
