
var TOKEN_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ0123456789" ;

var simToken = randomToken(12) ;

function randomToken( n ) {
	var token = "" ;
	for ( var i = 0 ; i < n ; ++i ) {
		if ( i!==0 && 0 === i%4 )
			token += "-" ;
		token += TOKEN_CHARS[ Math.floor(Math.random() * TOKEN_CHARS.length) ] ;
	}
	return token ;
}

function simListener(evt) {

	var frame = document.getElementById("simFrame").contentWindow ;
	frame.postMessage({
		"action": "SimulatedHyperspace:echo",
		"echo-data": evt.data,
		"token": simToken
	}, "*" );
	
}

function simStartup() {

	document.getElementById("token").innerText = simToken ;
	
	window.window.addEventListener( "message", simListener, false ) ;

	document.getElementById("simFrame").src = "demo.html?myParam=myValue" ;
}


