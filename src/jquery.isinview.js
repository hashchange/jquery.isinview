;( function( $ ) {
    "use strict";

    /**
     * Returns the window containing the the first element in the set of matched elements.
     *
     * If the element is a window, `ownerWindow` returns the window itself. If there aren't any matched elements,
     * `ownerWindow` returns undefined.
     *
     * If the element is _inside_ a frame or iframe, `ownerWindow`  returns the window representing the iframe . This is
     * subject to cross-domain security restrictions. Trying to access the content of the (i)frame will throw an error
     * if it is not from the same domain, or fetched with a different protocol.
     *
     * However, if the element _is_ the frame or iframe, `ownerWindow` returns the window containing the (i)frame.
     *
     * @returns {Window|undefined}
     */
    $.fn.ownerWindow = function () {
        var elem = this[0],
            ownerDocument = elem && ( elem.nodeType === 9 ? elem : elem.ownerDocument );

        return ownerDocument && ( ownerDocument.defaultView || ownerDocument.parentWindow ) || $.isWindow( elem ) && elem || undefined;
    };

    /**
     * Gets the TextRectangle coordinates relative to a container element.
     *
     * Do not call if the container is a window (redundant) or a document. Both calls would fail.
     */
    function getRelativeRect ( rect, $container ) {
        var containerRect = $container[0].getBoundingClientRect(),
            containerBorders = $container.css( [ "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth" ] );

        // gBCR coordinates enclose padding, and leave out margin. That is perfect because
        //
        // - padding scrolls (ie,o it is part of the scrollable area, and gBCR puts it inside)
        // - margin doesn't scroll (ie, it pushes the scrollable area to another position, and gBCR records that)
        //
        // Borders, however, don't scroll, so they are not part of the scrollable area - but gBCR puts them inside.
        //
        // (See http://jsbin.com/pivata/10 for an extensive test of gBCR behaviour.)
        return {
            top: rect.top - containerRect.top + parseFloat( containerBorders.borderTopWidth ),
            bottom: rect.bottom - containerRect.top - parseFloat( containerBorders.borderBottomWidth ),
            left: rect.left - containerRect.left + parseFloat( containerBorders.borderLeftWidth ),
            right: rect.right - containerRect.left - parseFloat( containerBorders.borderRightWidth )
        };
    }

    // Adapted from Ben Alman's scrollbarWidth plugin. See http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth,
    // and also http://jsbin.com/zeliy/1
    // todo use it!
    function getScrollbarWidth () {
        var parent,
            child;

        if ( _scrollbarWidth === undefined ) {
            parent = $('<div style="width: 50px; height: 50px; overflow: auto; position: absolute; top: -500px; left: -500px;"><div/></div>').appendTo('body');
            child = parent.children();
            _scrollbarWidth = child.innerWidth() - child.height( 99 ).innerWidth();
            parent.remove();
        }

        return _scrollbarWidth;
    }

    var _scrollbarWidth,
        root = window,
        $root = $( window ),
        $cachedContainer = $root;   // initial value

    /**
     * @param {Object}             [opts]
     * @param {boolean}            [opts.anyPart=false]         // todo or inFull=true
     * @param {boolean}            [opts.zeroSize=false]        // todo or collapsed=false, or hasDimensions=true, requireDimensions, mustTakeSpace, visibleImpact, displayedOnly=true
     * @param {string}             [opts.direction="both"]
     * @param {Node|jQuery|Window} [opts.container=window]      a window or a scrollable element, defaults to the (actual) containing window
     */
    $.fn.isInView = function ( opts ) {

        if ( !this.length ) return;

        opts || (opts = {});

        var container, $container, inCache, viewportWidth, viewportHeight, direction, useVertical, useHorizontal, rect,
            isInView = true,
            $elem = this,
            elem = this[0],

        // If non-zero size is required, we check if an element consumes space in the document. The limitation: We use
        // offsetWidth/Height, which checks the content (incl. borders) but ignores margins. Zero-size content with a
        // margin might actually consume space sometimes, but it won't be detected (see http://jsbin.com/tiwabo/3).
        //
        // Both the definition of visibility and the actual check are the same as in jQuery :visible.
            sizeOK = opts.zeroSize || ( elem.offsetWidth > 0 && elem.offsetHeight > 0 );

        // Bail out immediately if the element doesn't meet the size requirement for being visible
        if ( !sizeOK ) return false;

        // Establish the container, using the cache
        container = opts.container || $elem.ownerWindow();
        if ( container instanceof $ ) {
            if ( !container.length ) throw new Error( 'Invalid option value: container is an empty jQuery object' );
            $container = $cachedContainer = container;
        } else {
            inCache = $cachedContainer && container === $cachedContainer[0];
            $container = $cachedContainer = inCache ? $cachedContainer : container === root ? $root : $( container );
        }
        container = $container[0];

        // Spot likely mistakes early and throw a useful error
        if ( container.nodeType === 9 ) throw new Error( "Invalid option value: container is a document. Use the window instead, or pass in a scrollable element" );

        if ( opts.direction && !( opts.direction === 'vertical' || opts.direction === 'horizontal' || opts.direction === 'both' ) ) {
            throw new Error( 'Invalid option value: direction = "' + opts.direction + '"' );
        }

        direction = opts.direction || 'both';
        useVertical = direction === 'both' || direction === 'vertical';
        useHorizontal = direction === 'both' || direction === 'horizontal';

        if ( useHorizontal ) viewportWidth = $container.width();
        if ( useVertical ) viewportHeight = $container.height();

        // We can safely use getBoundingClientRect without a fallback. Its core properties (top, left, bottom, right)
        // are supported on the desktop for ages (IE5+). On mobile, too: supported from Blackberry 6+ (2010), iOS 4
        // (2010, iPhone 3GS+), according to the jQuery source comment in $.fn.offset.
        //
        // In oldIE (up to IE8), the coordinates were 2px off in each dimension because the "viewport" began at (2,2) of
        // the window. Can be feature-tested by creating an absolutely positioned div at (0,0) and reading the rect
        // coordinates. Won't be fixed here because the quirk is too minor to justify the overhead, just for oldIE.
        //
        // (See http://stackoverflow.com/a/10231202/508355 and Zakas, Professional Javascript (2012), p. 406)

        rect = elem.getBoundingClientRect();
        if ( ! $.isWindow( elem ) ) rect = getRelativeRect( rect, $container );

        if ( opts.anyPart ) {
            if ( useVertical ) isInView = rect.top < viewportHeight && rect.bottom > 0;
            if ( useHorizontal ) isInView = isInView && rect.left < viewportWidth && rect.right > 0;
        } else {
            if ( useVertical ) isInView = rect.top >= 0 && rect.top < viewportHeight && rect.bottom > 0 && rect.bottom <= viewportHeight;
            if ( useHorizontal ) isInView = isInView && rect.left >= 0 && rect.left < viewportWidth && rect.right > 0 && rect.right <= viewportWidth;
        }

        return isInView;

    };

}( jQuery || $ ));  // todo best solution?