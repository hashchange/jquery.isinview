/**
 * Forces a scroll bar, or both scroll bars, to appear on a scrollable element (or scrollable parent of that element).
 *
 * Does not ensure the "scrollability" of the element, ie it does not set the overflow property to "auto" or "scroll"
 * on an HTML element.
 *
 * ATTN Side effects:
 *
 * - If the element is in the normal flow and not positioned, it is switched to "position: relative"!
 * - Creates a div, appends it to the element and positions it outside of it to make a scroll bar appear.
 *
 * @param {HTMLElement|jQuery} elem
 * @param {string}             direction  "horizontal", "vertical", "both"
 */
function forceScrollbar ( elem, direction ) {
    var horizontal = direction === "horizontal" || direction === "both",
        vertical = direction === "vertical" || direction === "both",

        $elem = elem instanceof $ ? elem : $( elem ),
        doc = $elem[0].ownerDocument,
        $win = $( doc.defaultView || doc.parentWindow ),
        viewportWidth = $win.width(),
        viewportHeight = $win.height();

    if ( $elem.css( "position" ) === "static" || $elem.css( "position" ) === "" ) $elem.css( { position: "relative" } );

    $( "<div/>", doc )
        .css( {
            position: "absolute",
            width: horizontal ? 2 * viewportWidth : "1px",
            height: vertical ? 2 * viewportHeight : "1px",
            top: 0,
            left: 0
        } )
        .appendTo( $elem );
}


