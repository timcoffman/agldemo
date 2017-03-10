
function launchStartup( iss, launch ) {
  
  $.ajax( { url: iss + '/metadata', type: 'GET', dataType: 'xml' } )
    .done( receivedMetaData )
    .fail( ajaxFailed )
    ;  
}

function ajaxFailed( request, status, error ) {
  alert( status + ": " + error ) ;
}

function receivedMetaData( data, status, request ) {
  alert( data ) ;
}