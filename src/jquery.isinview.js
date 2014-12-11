;( function( $ ) {
    "use strict";

    var _selector_configCache,
        _scrollbarWidth,
        root = window,
        $root = $( window );

    /**
     * Returns the size (width) of the scrollbar, in pixels, as a number without unit.
     *
     * If the browser doesn't provide permanent scrollbars, and instead shows them as a temporary overlay while actually
     * scrolling the page, scrollbar size is reported as 0. That is the default behaviour in mobile browsers, and in
     * current versions of OS X.
     *
     * Adapted from Ben Alman's scrollbarWidth plugin. See
     * - http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
     * - http://jsbin.com/zeliy/1
     *
     * @returns {number}
     */
    $.scrollbarWidth = function () {
        var $parent, $child;

        if ( _scrollbarWidth === undefined ) {

            $child = $( "<div/>" ).css( { margin: 0, padding: 0, borderStyle: "none" } );
            $parent = $( "<div/>" )
                .css( {
                    width: "100px", height: "100px", overflow: "auto",
                    position: "absolute", top: "-500px", left: "-500px",
                    margin: 0, padding: 0, borderStyle: "none"
                } )
                .append( $child )
                .appendTo( "body" );

            _scrollbarWidth = $child.innerWidth() - $child.height( 150 ).innerWidth();
            $parent.remove();

        }

        return _scrollbarWidth;
    };

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
     * Acts as a filter and returns the elements in the set which are in view inside the window, or inside another
     * container.
     *
     * The container can be a window, iframe, scrollable element (overflow:scroll or overflow:auto), an element with
     * overflow:hidden, or a selector for any of these. Defaults to the window containing the elements.
     *
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     *
     * @returns {jQuery}
     */
    $.fn.inView = function ( container, opts ) {

        var config,
            $elems = this,
            inView = [];

        if ( !$elems.length ) return $();

        config = _prepareConfig( $elems, container, opts );

        // Check if the elements are children of the container. For performance reasons, only the first element is
        // examined.
        if ( ! config.containerIsWindow ) checkHierarchy( $elems[0], config.container );

        $elems.each( function () {
            if ( _isInView( this, config ) ) inView.push( this );
        } );

        return $( inView );
    };

    /**
     * Acts as a filter and returns the elements in the set which are in view inside the window.
     *
     * Shorthand for `$elem.inView( $elem.ownerWindow(), opts );`
     *
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     *
     * @returns {jQuery}
     */
    $.fn.inViewport = function ( opts ) {
        return this.inView( this.ownerWindow(), opts );
    };

    /**
     * Returns true if the element is in view inside the window, or inside another container. Examines the first element
     * in a set.
     *
     * The container can be a window, iframe, scrollable element (overflow:scroll or overflow:auto), an element with
     * overflow:hidden, or a selector for any of these. Defaults to the window containing the elements.
     *
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     *
     * @returns {boolean}
     */
    $.fn.isInView = function ( container, opts ) {

        var config,
            $elem = this,
            elem = this[0];

        if ( !$elem.length ) return false;

        config = _prepareConfig( $elem, container, opts );
        if ( ! config.containerIsWindow ) checkHierarchy( elem, config.container );

        return _isInView( elem, config );

    };

    /**
     * Returns true if the element is in view inside the window. Examines the first element in a set.
     *
     * Shorthand for `$elem.isInView( $elem.ownerWindow(), opts );`
     *
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     *
     * @returns {boolean}
     */
    $.fn.isInViewport = function ( opts ) {
        return this.isInView( this.ownerWindow(), opts );
    };

    /**
     * Custom :inViewport selector, equivalent to calling `inViewport()` on the set.
     *
     * @param {HTMLElement}   elem
     * @param {number}        index         in the set of elements
     * @param {Object}        selectorMeta  not needed here; see http://goo.gl/mVM9gJ for more
     * @param {HTMLElement[]} elemArray     the current set of elements
     */
    $.expr[":"].inViewport = function ( elem, index, selectorMeta, elemArray ) {

        var config = _selector_configCache;

        if ( index === 0 ) {
            config = _selector_configCache = _prepareConfig( $( elem ) );
            checkHierarchy( elem, config.container );
        } else if ( index === elemArray.length - 1 ) {
            _selector_configCache = undefined;
        }

        return _isInView( elem, config );

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

    /**
     * Establishes the container and returns it in a jQuery wrapper.
     *
     * Resolves and normalizes the input, which may be a document, HTMLElement, window, or selector string. Corrects
     * likely mistakes, such as passing in a document or an iframe, rather than the corresponding window.
     *
     * @param {Window|Document|HTMLElement|jQuery|string} container
     * @returns {jQuery}
     */
    function wrapContainer ( container ) {
        var $container;

        $container = container instanceof $ ? container : container === root ? $root : $( container );

        if ( !$container.length ) throw new Error( 'Invalid container: empty jQuery object' );

        container = $container[0];

        if ( container.nodeType === 9 ) {
            // Document is passed in, transform to window
            $container = wrapContainer( container.defaultView || container.parentWindow );
        } else if ( container.nodeType === 1 && container.tagName.toLowerCase() === "iframe" ) {
            // IFrame element is passed in, transform to IFrame content window
            $container = wrapContainer( container.contentWindow );
        }

        // Check if the container matches the requirements
        if ( !$.isWindow( $container[0] ) && $container.css( "overflow" ) === "visible" ) throw new Error( 'Invalid container: is set to overflow:visible. Containers must have the ability to obscure some of their content, otherwise the in-view test is pointless. Containers must be set to overflow:scroll/auto/hide, or be a window' );

        return $container;
    }

    /**
     * Checks if the element is a child of the container, and throws an error otherwise.
     *
     * For performance reasons, this check should *not* be run on every element in a set.
     *
     * @param {HTMLElement}                 elem
     * @param {Window|Document|HTMLElement} container
     */
    function checkHierarchy ( elem, container ) {

        var elemIsContained;

        // We need a DOM element for this check, so we use the documentElement as a proxy if the container is a window
        // or document.
        if ( $.isWindow( container ) ) {
            elemIsContained = $.contains( container.document.documentElement, elem );
        } else if ( container.nodeType === 9 ) {
            elemIsContained = $.contains( container.documentElement, elem );
        } else {
            elemIsContained = $.contains( container, elem );
        }

        if ( !elemIsContained ) throw new Error( "Invalid container: is a descendant of the element" );

    }

    /**
     * Spots likely option mistakes and throws appropriate errors.
     *
     * @param {Object} opts
     */
    function checkOptions ( opts ) {

        if ( opts.direction && !( opts.direction === 'vertical' || opts.direction === 'horizontal' || opts.direction === 'both' ) ) {
            throw new Error( 'Invalid option value: direction = "' + opts.direction + '"' );
        }

    }

    /**
     * Prepares the configuration for a single element query. Returns the config object which is to be consumed by
     * _isInView().
     *
     * @param {jQuery}                                    $elem                       single element, or set of elements
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     *
     * @returns {Object}
     */
    function _prepareConfig ( $elem, container, opts ) {

        var $container, direction,
            config = {};

        opts || ( opts = {} );

        container || ( container = $elem.ownerWindow() );
        config.$container = $container = wrapContainer( container );
        config.container = container = $container[0];

        checkOptions( opts );

        direction = opts.direction || 'both';
        config.useVertical = direction === 'both' || direction === 'vertical';
        config.useHorizontal = direction === 'both' || direction === 'horizontal';

        config.partially = opts.partially;
        config.excludeHidden = opts.excludeHidden;
        config.containerIsWindow = $.isWindow( container );

        return config;
    }

    /**
     * Returns if an element is in view, with regard to a given configuration.
     *
     * The configuration is built with _prepareConfig().
     *
     * @param {HTMLElement}        elem
     * @param {Object}             config
     * @param {HTMLElement|Window} config.container
     * @param {jQuery}             config.$container
     * @param {boolean}            config.containerIsWindow
     * @param {boolean}            config.useHorizontal
     * @param {boolean}            config.useVertical
     * @param {boolean}            config.partially
     * @param {boolean}            config.excludeHidden
     *
     * @returns {boolean}
     */
    function _isInView ( elem, config ) {

        var viewportWidth, viewportHeight, rect,
            container = config.container,
            $container = config.$container,
            isInView = true;

        if ( elem === container ) throw new Error( "Invalid container: is the same as the element" );

        // When hidden elements are ignored, we check if an element consumes space in the document. And we bail out
        // immediately if it doesn't.
        //
        // The test employed for this works in the vast majority of cases, but there is a limitation. We use offsetWidth
        // and offsetHeight, which considers the content (incl. borders) but ignores margins. Zero-size content with a
        // margin might actually consume space sometimes, but it won't be detected (see http://jsbin.com/tiwabo/3).
        //
        // That said, the definition of visibility and the actual test are the same as in jQuery :visible.
        if ( config.excludeHidden && !( elem.offsetWidth > 0 && elem.offsetHeight > 0 ) ) return false;

        if ( config.useHorizontal ) viewportWidth = $container.width();
        if ( config.useVertical ) viewportHeight = $container.height();

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
        if ( ! config.containerIsWindow ) rect = getRelativeRect( rect, $container );

        if ( config.partially ) {
            if ( config.useVertical ) isInView = rect.top < viewportHeight && rect.bottom > 0;
            if ( config.useHorizontal ) isInView = isInView && rect.left < viewportWidth && rect.right > 0;
        } else {
            if ( config.useVertical ) isInView = rect.top >= 0 && rect.top < viewportHeight && rect.bottom > 0 && rect.bottom <= viewportHeight;
            if ( config.useHorizontal ) isInView = isInView && rect.left >= 0 && rect.left < viewportWidth && rect.right > 0 && rect.right <= viewportWidth;
        }

        return isInView;

    }

}( jQuery || $ ));  // todo best solution?