
var selfOrigin = location.origin ;
var anyOrigin = "*" ;
var allowedOrigin = anyOrigin ; 

function demoStartup() {
  
  if ( location.search.substr(1).length != 0 ) {
    location.search.substr(1).split("&").forEach( function(p) {
      var tmp = p.split("=") ;

      var paramElement = document.getElementById("param-prototype").getElementsByClassName("param")[0].cloneNode(true);
      paramElement.getElementsByClassName('name')[0].innerText = decodeURIComponent(tmp[0]);
      paramElement.getElementsByClassName('value')[0].innerText = decodeURIComponent(tmp[1]);
      document.getElementById("params").appendChild( paramElement ) ;

    }) ;
  }
  
  var referrerElement = document.getElementById("param-prototype").getElementsByClassName("param")[0].cloneNode(true);
  referrerElement.getElementsByClassName('name')[0].innerText = "[referrer]";
  referrerElement.getElementsByClassName('value')[0].innerHTML = document.referrer.replace(/(.*):\/\/([^/]*)\/(.+)/g,"$1://$2<br>/$3");
  document.getElementById("params").appendChild( referrerElement ) ;
  
	window.addEventListener("message", listener, false);
	demoHandshake(true) ;
}

function demoDone() {
  post(CLOSE_ACTIVITY) ;
}

function demoHandshake(pause) {
  post(HANDSHAKE,null,pause) ;
}

function demoSave() {
  var state = document.getElementById("state").value ;
  post(SAVE_STATE, state) ;
}

function demoOrder() {
  var orderKey = document.getElementById("orderKey").value ;
  post(POST_ORDER, { OrderKey: orderKey } ) ;
}

function demoContinue() {
  unpausePost() ;
}

var HANDSHAKE = "Epic.Clinical.Informatics.Web.InitiateHandshake" ;
var CLOSE_ACTIVITY = "Epic.Clinical.Informatics.Web.CloseActivity" ;
var SAVE_STATE = "Epic.Clinical.Informatics.Web.SaveState" ;
var POST_ORDER = "Epic.Clinical.Informatics.Web.PostOrder" ;
var POST_FLOWSHEET_ROW = "Epic.Clinical.Informatics.Web.PostFlowsheetRow" ;
var OPEN_WINDOW = "Epic.Clinical.Informatics.Web.OpenWindow" ;

var ACTION_DESC = {
  "Epic.Clinical.Informatics.Web.InitiateHandshake": "Handshake",
  "Epic.Clinical.Informatics.Web.CloseActivity": "Close",
  "Epic.Clinical.Informatics.Web.SaveState": "Save",
  "Epic.Clinical.Informatics.Web.PostOrder": "Place Order",
  "Epic.Clinical.Informatics.Web.PostFlowsheetRow": "Flowsheet Row",
  "Epic.Clinical.Informatics.Web.OpenWindow": "Open Window"
}

var gCurrentRequest = null ;
var gToken = null ;

function createStepElement( message ) {
	var stepElement = document.getElementById("step-prototype").getElementsByClassName("step")[0].cloneNode(true);
  stepElement.getElementsByClassName('message')[0].innerText = message;
  
  return stepElement ;
}

function createStepDetailElement( html ) {
	var detailElement = document.createElement("div") ;
	detailElement.className = "detail" ;
	if ( arguments.length == 2 ) {
	  var label = arguments[0] ;
	  var value = (typeof arguments[1] == 'object') ? JSON.stringify(arguments[1], null ,2) : arguments[1] ;
	  detailElement.innerHTML = label + ': <span class="value">' + value + '</span>';
	} else {
	  detailElement.innerHTML = html ;
	}
	gCurrentRequest.stepElement.appendChild( detailElement ) ;
	
	return detailElement ;
}

function post(action, args, pause) {
  var stepElement = createStepElement( ACTION_DESC[action] || action ) ;  
	document.getElementById("steps").appendChild( stepElement ) ;
  
  gCurrentRequest = {
    action: action,
    args: args,
    status: 'init',
    stepElement: stepElement,
    eventCount: 0,
    post: function() {
      delete this.post ;
      
      window.parent.postMessage({
      	action: this.action,
      	token: gToken,
      	args: this.args
      },allowedOrigin);
      
      this.status = 'pending' ;
      this.stepElement.className = "step info-box " + this.status ;
    }
  };
	
	if ( !pause )
	  unpausePost() ;

  return gCurrentRequest ;
}

function unpausePost() {
  if ( gCurrentRequest.post )
    gCurrentRequest.post() ;
}

function listener(evt) {
  
  if ( !gCurrentRequest.eventCount )
		createStepDetailElement( "Origin", event.origin ) ;
  ++gCurrentRequest.eventCount ;

  var logRequest = new XMLHttpRequest();
  logRequest.open('POST','/log',true);
  logRequest.setRequestHeader("Content-Type","application/json");
  logRequest.send( JSON.stringify(evt.data) ) ;
  
	for ( var type in evt.data ) {
		var contents = evt.data[type] ;
		if ( "token" == type ) {
			
			gToken = contents ;
			createStepDetailElement( "token", gToken ) ;
			
		} else if ( "features" == type ) {
			
			for ( var action in contents ) {
  			var elements = document.getElementsByClassName( 'feature-' + contents[action].replace(/([/.$])/g,"\\$1") ) ;
  			for ( var i=0 ; i < elements.length; ++i )
  			  elements.item(i).className = elements.item(i).className.replace(/feature-disabled/,'') ;
			}

		} else if ( "actionExecuted" == type ) {
      
      gCurrentRequest.status = contents ? 'complete' : 'incomplete' ;
      gCurrentRequest.stepElement.className = "step info-box " + gCurrentRequest.status ;
      
		} else if ( "state" == type ) {
        
      document.getElementById("state").value = contents ;
      
		} else if ( "error" == type ) {
      
      for ( var k in contents )
  			createStepDetailElement( type, contents[k] ) ;

		} else {
      
			createStepDetailElement( type, contents ) ;
			
		}
		
	}
}

