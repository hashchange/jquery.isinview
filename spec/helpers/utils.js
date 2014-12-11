/**
 * Creates a child window, including a document with an HTML 5 doctype, UFT-8 charset, head, title, and body tags.
 * Returns the handle, or undefined if window creation fails.
 *
 * If the child window can't be created, a pop-up blocker usually prevents it. Pop-up blockers are active by default in
 * most browsers - Chrome, for instance.
 *
 * @returns {Window|undefined}
 */
function createChildWindow () {
    var childWindow = window.open();

    if ( childWindow ) {

        // Setting the document content (using plain JS - jQuery can't write an entire HTML document, including the
        // doctype and <head> tags).
        childWindow.document.open();
        childWindow.document.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );
        childWindow.document.close();

    }

    return childWindow;
}

function createIframe () {
    var iframe = $( "<iframe/>" )[0];
    iframe.contentDocument.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );
    return iframe;
}

function getTimestamp () {
    return Date.now && Date.now() || +new Date();
}

function log ( message ) {
    "use strict";
    if ( typeof console !== "undefined" && console.log ) console.log( message );
}

function warn ( message ) {
    "use strict";
    if ( typeof console !== "undefined" ) console.warn && console.warn( message ) || console.log && console.log( message );
}

