// !!!!!!!!!!!!!!!!!!!!!!!!!!
// Depends on basic-utils.js
// !!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * Creates a child window, including a document with an HTML 5 doctype, UFT-8 charset, head, title, and body tags.
 * Returns the handle, or undefined if window creation fails.
 *
 * Optionally accepts a jQuery Deferred. The deferred is resolved when the document in the child window is ready. If the
 * child window can't be created, the deferred is rejected. (For this, jQuery needs to be loaded, obviously.)
 *
 * If the child window can't be created, a pop-up blocker usually prevents it. Pop-up blockers are active by default in
 * most browsers - Chrome, for instance.
 *
 * @param   {jQuery.Deferred}  [readyDfd]
 * @returns {Window|undefined}
 */
function createChildWindow ( readyDfd ) {
    var childWindow = window.open();

    if ( childWindow ) {

        // Setting the document content (using plain JS - jQuery can't write an entire HTML document, including the
        // doctype and <head> tags).
        childWindow.document.open();
        childWindow.document.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );
        childWindow.document.close();

    }

    if ( readyDfd ) {
        if ( ! varExists( $ ) ) throw new Error( "`$` variable is not available. For using a readyDfd, jQuery (or a compatible library) must be loaded" );

        if (  childWindow && childWindow.document ) {
            $( childWindow.document ).ready ( readyDfd.resolve );
        } else {
            readyDfd.reject();
        }
    }

    return childWindow;
}

/**
 * Creates an iframe with a default HTML5, UTF-8-encoded document.
 *
 *
 * Optionally accepts a jQuery Deferred. The deferred is resolved when the document in the iframe is ready. (For this,
 * jQuery needs to be loaded, obviously.)
 *
 * @param   {jQuery.Deferred}    [readyDfd]
 * @param   {HTMLDocument}       [documentContext=document]  the document in which the iframe should be created
 * @returns {HTMLIFrameElement}
 */
function createIframe ( readyDfd, documentContext ) {
    var iframe = ( documentContext || document ).createElement( "iframe" );
    iframe.contentDocument.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );

    if ( readyDfd ) {
        if ( ! varExists( $ ) ) throw new Error( "`$` variable is not available. For using a readyDfd, jQuery (or a compatible library) must be loaded" );
        $( iframe.contentDocument ).ready ( readyDfd.resolve );
    }

    return iframe;
}
