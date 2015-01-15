// jQuery.isInView, v0.3.0
// Copyright (c)2015 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/jquery.isinview

;( function( $ ) {
    "use strict";

    var _scrollbarWidth,
        root = window,
        $root = $( window );

    /**
     * Checks if an element has a scroll bar. The axis can be specified, both axes are checked by default.
     *
     * The return type depends on whether one or both axes are queried. For a single axis, the method returns a boolean.
     * For both axes, it returns an object with the state of each individual axis, e.g. `{ vertical: true, horizontal:
     * false }`.
     *
     * The method
     *
     * - only acts on the first element of a jQuery set
     * - returns undefined if the set is empty
     * - looks for window scroll bars if called on a window, document, or document element (html tag)
     * - looks for scroll bars on the content window of an iframe if called on the iframe element
     * - looks for scroll bars on the body tag itself if called on the body. Usually, there aren't any - if you want to
     *   find out about window scroll bars, don't call the method on the body.
     *
     * Note that the method checks for the presence of a scroll bar and nothing else. It doesn't mean that the scroll
     * bar actually scrolls, or takes up any space:
     *
     * - It always returns true for overflow:scroll, even if the element doesn't contain content which needs to be
     *   scrolled.
     * - It returns true if there is a scroll bar of width 0, which is the standard behaviour of Safari on the Mac and
     *   on iOS.
     *
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {boolean|Object}
     */
    $.fn.hasScrollbar = function ( axis ) {
        return hasScrollbar( this, axis );
    };

    /**
     * Returns the effective size (width) of a scrollbar on the element, in pixels, as a number without unit. The axis
     * can be specified, both axes are queried by default.
     *
     * The return type depends on whether one or both axes are queried. For a single axis, the method returns a number.
     * For both axes, it returns an object with the size of each individual scroll bar, e.g. `{ vertical: 28,
     * horizontal: 0 }`.
     *
     * For a given axis, the method returns the global value of $.scrollbarWidth() if there is a scroll bar, and 0 if
     * there isn't. It does not handle custom scroll bars. The default scroll bars of the browser are expected to
     * appear.
     *
     * Only acts on the first element of a jQuery set. Throws an error if the set is empty.
     *
     * Note that the method does not allow you to infer the presence of a scroll bar, or whether it actually scrolls:
     *
     * - It always returns the default width for overflow:scroll, even if the element doesn't contain content which
     *   needs to be scrolled.
     * - It returns 0 if there is no scroll bar, or if there is a scroll of width 0, which is the standard behaviour of
     *   Safari on the Mac and on iOS.
     *
     * For the type of jQuery sets the method can be called on, and how they are handled, see $.fn.hasScrollbar.
     *
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {number|Object}
     */
    $.fn.scrollbarWidth = function ( axis ) {
        return effectiveScrollbarWith( this, axis );
    };

    /**
     * Returns the size (width) of the scrollbar for a given browser, in pixels, as a number without unit.
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
    $.scrollbarWidth = browserScrollbarWidth;

    /**
     * Returns the window containing the the first element in the set of matched elements.
     *
     * If the element is a window, `ownerWindow` returns the window itself. If there aren't any matched elements,
     * `ownerWindow` returns undefined.
     *
     * If the element is _inside_ an iframe, `ownerWindow` returns the window representing the iframe. (Please keep in
     * mind that selecting elements inside an iframe is subject to cross-domain security restrictions, and may not
     * work.)
     *
     * However, if the element _is_ the frame or iframe, `ownerWindow` returns the window containing the (i)frame.
     *
     * @returns {Window|undefined}
     */
    $.fn.ownerWindow = function () {
        return ownerWindow( this );
    };

    /**
     * Acts as a filter and returns the elements in the set which are in view inside the window, or inside another
     * container.
     *
     * The container can be a window, iframe, scrollable element (overflow:scroll or overflow:auto), an element with
     * overflow:hidden, or a selector for any of these. Defaults to the window containing the elements.
     *
     * The size of the element is defined by its border-box, which includes its padding and border. Alternatively, the
     * content-box of the element can be used, excluding padding and borders.
     *
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     * @param {string}                                    [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string}                             [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {jQuery}
     */
    $.fn.inView = function ( container, opts ) {
        return inView( this, container, opts );
    };

    /**
     * Acts as a filter and returns the elements in the set which are in view inside the window.
     *
     * Shorthand for `$elem.inView( $elem.ownerWindow(), opts );`
     *
     * @param {Object}        [opts]
     * @param {boolean}       [opts.partially=false]
     * @param {boolean}       [opts.excludeHidden=false]
     * @param {string}        [opts.direction="both"]
     * @param {string}        [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string} [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {jQuery}
     */
    $.fn.inViewport = function ( opts ) {
        return inView( this, ownerWindow( this ), opts );
    };

    /**
     * Returns true if the element is in view inside the window, or inside another container. Examines the first element
     * in a set.
     *
     * The container can be a window, iframe, scrollable element (overflow:scroll or overflow:auto), an element with
     * overflow:hidden, or a selector for any of these. Defaults to the window containing the elements.
     *
     * The size of the element is defined by its border-box, which includes its padding and border. Alternatively, the
     * content-box of the element can be used, excluding padding and borders.
     *
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     * @param {string}                                    [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string}                             [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {boolean}
     */
    $.fn.isInView = function ( container, opts ) {
        return isInView( this, container, opts );
    };

    /**
     * Returns true if the element is in view inside the window. Examines the first element in a set.
     *
     * Shorthand for `$elem.isInView( $elem.ownerWindow(), opts );`
     *
     * @param {Object}        [opts]
     * @param {boolean}       [opts.partially=false]
     * @param {boolean}       [opts.excludeHidden=false]
     * @param {string}        [opts.direction="both"]
     * @param {string}        [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string} [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {boolean}
     */
    $.fn.isInViewport = function ( opts ) {
        return isInView( this, ownerWindow( this ), opts );
    };

    /**
     * Custom :inViewport selector, equivalent to calling `inViewport()` on the set.
     */
    $.expr.match.inviewport = /^(?:inVieport)$/i;

    $.expr.setFilters.inviewport = $.expr.createPseudo( function () {
        return $.expr.createPseudo( function ( elems, matches ) {
            var i, config,
                length =  elems.length;

            if ( length ) {

                config = _prepareConfig( $( elems ) );
                checkHierarchy( elems[0], config.container );

                for ( i = 0; i < length; i++ ) {
                    matches[i] = _isInView( elems[i], config ) ? elems[i] : undefined;
                }
            }

        } );
    } );

    /**
     * Does the actual work of $.fn.hasScrollbar. Protected from external modification. See $.fn.hasScrollbar for
     * details.
     *
     * @param   {jQuery} $elem
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {boolean|Object}
     */
    function hasScrollbar ( $elem, axis ) {

        var queryHorizontal, queryVertical, queryBoth, horizontal, vertical,
            isWindow, _document, $document, documentElement, body,
            overflowPropNames, props, bodyProps, bodyBoxProps,
            bodyOverflowHiddenX, bodyOverflowHiddenY, bodyPositioned,
            overflowScrollX, overflowScrollY, overflowAutoX, overflowAutoY, overflowVisibleX, overflowVisibleY,
            innerWidth, innerHeight, scrollWidth, scrollHeight,
            bodyScrollWidth, bodyScrollHeight, ddeScrollWidth, ddeScrollHeight,
            elem = $elem[0];

        $elem = $elem.eq( 0 );
        axis || ( axis = "both" );

        queryBoth = axis === "both";
        queryHorizontal = axis === "horizontal" || queryBoth;
        queryVertical = axis === "vertical" || queryBoth;

        if ( axis !== "horizontal" && axis !== "vertical" && axis !== "both" ) throw new Error( "Invalid parameter value: axis = " + axis );
        if ( ! $elem.length ) return;

        // Transformations:
        // - If called on a window, we need document, documentElement and body, and discard the element
        // - If called on the document or document element, we treat it like a call on window (above)
        // - If called on an iframe element, we treat it like a window call, using the iframe content window
        isWindow = $.isWindow( elem );
        if ( isWindow ) {
            _document = elem.document;
        } else if ( elem.nodeType === 9 ) {
            _document = elem;
            isWindow = true;
        } else if ( elem === elem.ownerDocument.documentElement ) {
            _document = elem.ownerDocument;
            isWindow = true;
        } else if ( elem.nodeType === 1 && elem.tagName.toLowerCase() === "iframe" ) {
            _document = elem.contentDocument || elem.contentWindow.document;
            isWindow = true;
        }

        if ( isWindow ) {
            $document = $( _document );
            documentElement = _document.documentElement;
            body = _document.body;
            elem = $elem = undefined;
        }

        // Query the overflow settings; if we deal with window scroll bars, we also need those of the body
        overflowPropNames = [ "overflow" ];
        if ( queryHorizontal ) overflowPropNames.push( "overflowX" );
        if ( queryVertical ) overflowPropNames.push( "overflowY" );
        if ( isWindow ) {
            bodyProps = getCss( body, [ "overflow", "overflowX", "overflowY", "position" ], { toLowerCase: true } );
            bodyOverflowHiddenX = bodyProps.overflow === "hidden" || bodyProps.overflowX === "hidden";
            bodyOverflowHiddenY = bodyProps.overflow === "hidden" || bodyProps.overflowY === "hidden";
            bodyPositioned = bodyProps.position === "absolute" || bodyProps.position === "relative";
        }

        props = getCss( isWindow ? documentElement : elem, overflowPropNames, { toLowerCase: true } );

        overflowScrollX = props.overflowX === "scroll" || ( ! props.overflowX && props.overflow === "scroll" );
        overflowScrollY = props.overflowY === "scroll" || ( ! props.overflowY && props.overflow === "scroll" );
        overflowAutoX = props.overflowX === "auto" || ( ! props.overflowX && props.overflow === "auto" );
        overflowAutoY = props.overflowY === "auto" || ( ! props.overflowY && props.overflow === "auto");
        overflowVisibleX = props.overflowX === "visible" || ( ! props.overflowX && props.overflow === "visible" );
        overflowVisibleY = props.overflowY === "visible" || ( ! props.overflowY && props.overflow === "visible" );

        if ( isWindow ) {

            if ( queryHorizontal ) horizontal = overflowScrollX || ( overflowAutoX || overflowVisibleX ) && documentElement.clientWidth < $document.width();
            if ( queryVertical ) vertical = overflowScrollY || ( overflowAutoY || overflowVisibleY ) &&  documentElement.clientHeight < $document.height();

            // Handle body with overflow: hidden
            if ( bodyOverflowHiddenX || bodyOverflowHiddenY ) bodyBoxProps = getCss( body, [ "borderTopWidth", "borderLeftWidth", "marginTop", "marginLeft" ], { toFloat: true } );

            if ( bodyOverflowHiddenX ) {

                if ( bodyPositioned ){
                    // If the body is positioned, it is the offset parent of all content, hence every overflow is hidden.
                    // Only overflow: scroll on the html element can make scroll bars appear (and they won't have anything
                    // to scroll).
                    horizontal = overflowScrollX;
                } else {
                    bodyScrollWidth = body.scrollWidth;
                    ddeScrollWidth = documentElement.scrollWidth;

                    // Testing if the document is smaller or equal to the body (it could be larger, e.g. because of
                    // positioned content). If so, the document does not cause scroll bars. Only overflow:scroll would
                    // make them appear.
                    //
                    // Condition 1 captures: Chrome, Chrome on Android, Safari on OS X, iOS, Opera;
                    // Condition 2 captures: FF, IE9+
                    // Browser behaviour can be tested/investigated with http://jsbin.com/vofuba/9/
                    if ( bodyScrollWidth === ddeScrollWidth || bodyScrollWidth + bodyBoxProps.borderLeftWidth + bodyBoxProps.marginLeft === ddeScrollWidth ) {
                        horizontal = overflowScrollX;
                    }
                }

            }

            if ( bodyOverflowHiddenY ) {

                if ( bodyPositioned ){
                    // See above, bodyOverflowHiddenX branch.
                    vertical = overflowScrollY;
                } else {
                    bodyScrollHeight = body.scrollHeight;
                    ddeScrollHeight = documentElement.scrollHeight;

                    // See above, bodyOverflowHiddenX branch..
                    if ( bodyScrollHeight === ddeScrollHeight || bodyScrollHeight + bodyBoxProps.borderTopWidth + bodyBoxProps.marginTop === ddeScrollHeight ) {
                        vertical = overflowScrollY;
                    }
                }
            }

        } else {

            // Scroll bars on an HTML element
            scrollWidth = elem.scrollWidth;
            scrollHeight = elem.scrollHeight;

            horizontal = scrollWidth > 0 && ( overflowScrollX || overflowAutoX && ( innerWidth = $elem.innerWidth() ) < scrollWidth );
            vertical = scrollHeight > 0 && ( overflowScrollY || overflowAutoY && ( innerHeight = $elem.innerHeight() ) < scrollHeight );

            // Detect if the appearance of one scroll bar causes the other to appear, too.
            // todo what if this triggers and overflow is hidden or visible - phantom scroll bar detected? what does scroll height return for these overflow types?
            vertical = vertical || horizontal && innerHeight - browserScrollbarWidth() < scrollHeight;
            horizontal = horizontal || vertical && innerWidth - browserScrollbarWidth() < scrollWidth;

        }

        return queryBoth ? { horizontal: horizontal, vertical: vertical } : queryHorizontal ? horizontal : vertical;
    }

    /**
     * Does the actual work of $.scrollbarWidth. Protected from external modification. See $.scrollbarWidth for details.
     *
     * @returns {number}
     */
    function browserScrollbarWidth () {
        var $parent, $child;

        if ( _scrollbarWidth === undefined ) {

            $child = $( document.createElement( "div" ) ).css( { margin: 0, padding: 0, borderStyle: "none" } );
            $parent = $( document.createElement( "div" ) )
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
    }

    /**
     * Does the actual work of $.fn.scrollbarWidth. Protected from external modification. See $.fn.scrollbarWidth for
     * details.
     *
     * @param   {jQuery} $elem
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {number|Object}
     */
    function effectiveScrollbarWith ( $elem, axis ) {

        var queryHorizontal, queryVertical, queryBoth, elemHasScrollbar, horizontal, vertical,
            globalWidth = browserScrollbarWidth();

        axis || ( axis = "both" );

        queryBoth = axis === "both";
        queryHorizontal = axis === "horizontal" || queryBoth;
        queryVertical = axis === "vertical" || queryBoth;

        if ( axis !== "horizontal" && axis !== "vertical" && axis !== "both" ) throw new Error( "Invalid parameter value: axis = " + axis );
        if ( ! $elem.length ) return;

        // Bail out early, without an $elem.hasScrollbar() query, if scroll bars don't take up any space.
        if ( globalWidth === 0 ) return queryBoth ? { horizontal: 0, vertical: 0 } : 0;

        elemHasScrollbar = queryBoth ? hasScrollbar( $elem ) : queryHorizontal ? { horizontal: hasScrollbar( $elem, "horizontal" ) } : { vertical: hasScrollbar( $elem, "vertical" ) };

        if ( queryHorizontal ) horizontal = elemHasScrollbar.horizontal ? globalWidth : 0;
        if ( queryVertical ) vertical = elemHasScrollbar.vertical ? globalWidth : 0;

        return queryBoth ? { horizontal: horizontal, vertical: vertical } : queryHorizontal ? horizontal : vertical;

    }

    /**
     * Does the actual work of $.fn.ownerWindow. Protected from external modification. See $.fn.ownerWindow for details.
     *
     * @param   {jQuery} $elem
     * @returns {Window|undefined}
     */
    function ownerWindow ( $elem ) {
        var elem = $elem[0],
            ownerDocument = elem && ( elem.nodeType === 9 ? elem : elem.ownerDocument );

        return ownerDocument && ( ownerDocument.defaultView || ownerDocument.parentWindow ) || $.isWindow( elem ) && elem || undefined;
    }

    /**
     * Does the actual work of $.fn.inView. Protected from external modification. See $.fn.inView for details.
     *
     * @param {jQuery}                                    $elems
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     * @param {string}                                    [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string}                             [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {jQuery}
     */
    function inView ( $elems, container, opts ) {

        var config,
            elemsInView = [];

        if ( ! $elems.length ) return $();

        config = _prepareConfig( $elems, container, opts );

        // Check if the elements are children of the container. For performance reasons, only the first element is
        // examined.
        checkHierarchy( $elems[0], config.container );

        $elems.each( function () {
            if ( _isInView( this, config ) ) elemsInView.push( this );
        } );

        return $( elemsInView );

    }

    /**
     * Does the actual work of $.fn.isInView. Protected from external modification. See $.fn.isInView for details.
     *
     * @param {jQuery}                                    $elem
     * @param {Window|Document|HTMLElement|jQuery|string} [container=window]
     * @param {Object}                                    [opts]
     * @param {boolean}                                   [opts.partially=false]
     * @param {boolean}                                   [opts.excludeHidden=false]
     * @param {string}                                    [opts.direction="both"]
     * @param {string}                                    [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string}                             [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {boolean}
     */
    function isInView ( $elem, container, opts ) {

        var config,
            elem = $elem[0];

        if ( ! $elem.length ) return false;

        config = _prepareConfig( $elem, container, opts );
        checkHierarchy( elem, config.container );

        return _isInView( elem, config );

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
     * @param {string}                                    [opts.box="border-box"]     alternatively, "content-box"
     * @param {number|string}                             [opts.tolerance=0]          number only (px), or with unit ("px" or "%" only)
     *
     * @returns {Object}
     */
    function _prepareConfig ( $elem, container, opts ) {

        var $container, direction,
            config = {};

        opts || ( opts = {} );

        container || ( container = ownerWindow( $elem ) );
        config.$container = $container = wrapContainer( container );
        config.container = container = $container[0];

        checkOptions( opts );

        direction = opts.direction || 'both';
        config.useVertical = direction === 'both' || direction === 'vertical';
        config.useHorizontal = direction === 'both' || direction === 'horizontal';

        config.partially = opts.partially;
        config.excludeHidden = opts.excludeHidden;
        config.borderBox = opts.box !== 'content-box';
        config.containerIsWindow = $.isWindow( container );

        if ( typeof opts.tolerance !== "undefined" ) {
            config.toleranceType = ( isNumber( opts.tolerance ) || opts.tolerance.slice( -3 ) === "px" ) ? "add" : "multiply";
            config.tolerance = config.toleranceType === "add" ? parseFloat( opts.tolerance ) : parseFloat( opts.tolerance ) / 100 + 1;
        } else {
            config.tolerance = 0;
            config.toleranceType = "add";
        }

        // Create an object to cache DOM queries with regard to the viewport, for faster repeated access.
        config.cache = {};

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
     * @param {Object}             config.cache
     * @param {boolean}            config.useHorizontal
     * @param {boolean}            config.useVertical
     * @param {boolean}            config.partially
     * @param {boolean}            config.excludeHidden
     * @param {boolean}            config.borderBox
     * @param {number}             config.tolerance
     * @param {string}             config.toleranceType
     *
     * @returns {boolean}
     */
    function _isInView ( elem, config ) {

        var containerWidth, containerHeight, hTolerance, vTolerance, rect,
            container = config.container,
            $container = config.$container,
            cache = config.cache,
            elemInView = true;

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

        // todo make sure the cache is used even if containerWidth or containerHeight is 0 (and perhaps exit right away).
        if ( config.useHorizontal ) containerWidth = cache.containerWidth || ( cache.containerWidth = getNetContainerWidth( $container, config.containerIsWindow ) );
        if ( config.useVertical ) containerHeight = cache.containerHeight || ( cache.containerHeight = getNetContainerHeight( $container, config.containerIsWindow ) );

        // Convert tolerance to a px value (if given as a percentage)
        hTolerance = cache.hTolerance || ( cache.hTolerance = config.toleranceType === "add" ? config.tolerance : containerWidth * config.tolerance );
        vTolerance = cache.vTolerance || ( cache.vTolerance = config.toleranceType === "add" ? config.tolerance : containerHeight * config.tolerance );

        // We can safely use getBoundingClientRect without a fallback. Its core properties (top, left, bottom, right)
        // are supported on the desktop for ages (IE5+). On mobile, too: supported from Blackberry 6+ (2010), iOS 4
        // (2010, iPhone 3GS+), according to the jQuery source comment in $.fn.offset.
        //
        // In oldIE (up to IE8), the coordinates were 2px off in each dimension because the "viewport" began at (2,2) of
        // the window. Can be feature-tested by creating an absolutely positioned div at (0,0) and reading the rect
        // coordinates. Won't be fixed here because the quirk is too minor to justify the overhead, just for oldIE.
        //
        // (See http://stackoverflow.com/a/10231202/508355 and Zakas, Professional Javascript (2012), p. 406)

        rect = config.borderBox ? elem.getBoundingClientRect() : getContentRect( elem );
        if ( ! config.containerIsWindow ) rect = getRelativeRect( rect, $container, cache );

        if ( config.partially ) {
            if ( config.useVertical ) elemInView = rect.top < containerHeight + vTolerance && rect.bottom > -vTolerance;
            if ( config.useHorizontal ) elemInView = elemInView && rect.left < containerWidth + hTolerance && rect.right > -hTolerance;
        } else {
            if ( config.useVertical ) elemInView = rect.top >= -vTolerance && rect.top < containerHeight + vTolerance && rect.bottom > -vTolerance && rect.bottom <= containerHeight + vTolerance;
            if ( config.useHorizontal ) elemInView = elemInView && rect.left >= -hTolerance && rect.left < containerWidth + hTolerance && rect.right > -hTolerance && rect.right <= containerWidth + hTolerance;
        }

        return elemInView;

    }

    /**
     * Gets the TextRectangle coordinates relative to a container element.
     *
     * Do not call if the container is a window (redundant) or a document. Both calls would fail.
     */
    function getRelativeRect ( rect, $container, cache ) {
        var containerRect,
            containerProps,
            relativeRectCorrections;

        if ( cache && cache.relativeRectCorrections ) {

            relativeRectCorrections = cache.relativeRectCorrections;

        } else {
            // gBCR coordinates enclose padding, and leave out margin. That is perfect for scrolling because
            //
            // - padding scrolls (ie,o it is part of the scrollable area, and gBCR puts it inside)
            // - margin doesn't scroll (ie, it pushes the scrollable area to another position, and gBCR records that)
            //
            // Borders, however, don't scroll, so they are not part of the scrollable area, but gBCR puts them inside.
            //
            // (See http://jsbin.com/pivata/10 for an extensive test of gBCR behaviour.)

            containerRect = $container[0].getBoundingClientRect();
            containerProps = toFloat( $container.css( [ "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth" ] ) );
            relativeRectCorrections = {
                top: containerRect.top - containerProps.borderTopWidth,
                bottom: containerRect.top + containerProps.borderBottomWidth,
                left: containerRect.left - containerProps.borderLeftWidth,
                right: containerRect.left + containerProps.borderRightWidth
            };

            // Cache the calculations
            if ( cache ) cache.relativeRectCorrections = $.extend( {}, relativeRectCorrections );
        }

        return {
            top: rect.top - relativeRectCorrections.top,
            bottom: rect.bottom - relativeRectCorrections.bottom,
            left: rect.left - relativeRectCorrections.left,
            right: rect.right - relativeRectCorrections.right
        };
    }

    /**
     * Calculates the rect of the content-box. Similar to getBoundingClientRect, but excludes padding and borders - and
     * is much slower.
     *
     * @param   {HTMLElement} elem
     * @returns {Object}
     */
    function getContentRect( elem ) {

        var rect = elem.getBoundingClientRect(),
            props = getCss( elem, [
                "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
                "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"
            ], { toFloat: true } );

        return {
            top: rect.top + props.paddingTop + props.borderTopWidth,
            right: rect.right - ( props.paddingRight + props.borderRightWidth ),
            bottom: rect.bottom - ( props.paddingBottom + props.borderBottomWidth ),
            left: rect.left + props.paddingLeft + props.borderLeftWidth
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
        if ( !$.isWindow( $container[0] ) && $container.css( "overflow" ) === "visible" ) throw new Error( 'Invalid container: is set to overflow:visible. Containers must have the ability to obscure some of their content, otherwise the in-view test is pointless. Containers must be set to overflow:scroll/auto/hide, or be a window (or document, or iframe, as proxies for a window)' );

        return $container;
    }

    /**
     * Checks if the element is a descendant of the container, and throws an error otherwise. Also checks the type of
     * the element (must indeed be an element node).
     *
     * For performance reasons, this check should *not* be run on every element in a set.
     *
     * @param {HTMLElement}                 elem
     * @param {Window|Document|HTMLElement} container
     */
    function checkHierarchy ( elem, container ) {

        var elemIsContained;

        if ( elem.nodeType !== 1 ) throw new Error( "Invalid node: is not an element" );

        if ( $.isWindow( container ) ) {
            elemIsContained = elem.ownerDocument && container === ( elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow );
        } else if ( container.nodeType === 9 ) {
            // We need a DOM element for this check, so we use the documentElement as a proxy if the container is a document.
            elemIsContained = $.contains( container.documentElement, elem );
        } else {
            elemIsContained = $.contains( container, elem );
        }

        if ( !elemIsContained ) throw new Error( "Invalid container: is not an ancestor of the element" );

    }

    /**
     * Spots likely option mistakes and throws appropriate errors.
     *
     * @param {Object} opts
     */
    function checkOptions ( opts ) {
        var isNum, isNumWithUnit;

        if ( opts.direction && !( opts.direction === 'vertical' || opts.direction === 'horizontal' || opts.direction === 'both' ) ) {
            throw new Error( 'Invalid option value: direction = "' + opts.direction + '"' );
        }

        if ( opts.box && !( opts.box === 'border-box' || opts.box === 'content-box' ) ) {
            throw new Error( 'Invalid option value: box = "' + opts.box + '"' );
        }

        if ( typeof opts.tolerance !== "undefined" ) {
            isNum = isNumber( opts.tolerance );
            isNumWithUnit = isString( opts.tolerance ) && ( /^[+-]?\d*\.?\d+(px|%)?$/.test( opts.tolerance ) );
            if ( ! ( isNum || isNumWithUnit ) ) throw new Error( 'Invalid option value: tolerance = "' + opts.tolerance + '"' );
        }

    }

    /**
     * Gets the width of a jQuery-wrapped container, excluding scroll bars. Also supports quirks mode for window
     * containers, unlike jQuery's $( window ).width().
     *
     * @param {jQuery}  $container
     * @param {boolean} isWindow    required to speed up the process
     * @returns {number}
     */
    function getNetContainerWidth ( $container, isWindow ) {
        // todo cache effectiveScrollbarWith( $container ), is used in getNetContainerHeight as well
        var containerScrollbarWidths;
        if ( ! isWindow ) containerScrollbarWidths = effectiveScrollbarWith( $container );

        return isWindow ? getWindowDimension( $container, "Width" ) : $container.innerWidth() - containerScrollbarWidths.vertical;
    }

    /**
     * Gets the height of a jQuery-wrapped container, excluding scroll bars. Also supports quirks mode for window
     * containers, unlike jQuery's $( window ).width().
     *
     * @param {jQuery}  $container
     * @param {boolean} isWindow    required to speed up the process
     * @returns {number}
     */
    function getNetContainerHeight ( $container, isWindow ) {
        // todo cache effectiveScrollbarWith( $container ), is used in getNetContainerWidth as well
        var containerScrollbarWidths;
        if ( ! isWindow ) containerScrollbarWidths = effectiveScrollbarWith( $container );

        return isWindow ? getWindowDimension( $container, "Height" ) : $container.innerHeight() - containerScrollbarWidths.horizontal;
    }

    /**
     * Gets the width or height of a jQuery-wrapped window. Use it instead of $container.width(). Supports quirks mode,
     * unlike jQuery.
     *
     * Window dimensions are calculated as in Zakas, Professional Javascript (2012), p. 404. The standards mode part of
     * it is the same as in jQuery, too.
     *
     * @param {jQuery} $window
     * @param {string} dimension  "Width" or "Height" (capitalized!)
     * @returns {number}
     */
    function getWindowDimension ( $window, dimension ) {
        var doc = $window[0].document,
            method = "client" + dimension;

        return doc.compatMode === "BackCompat" ? doc.body[method] : doc.documentElement[method];
    }

    /**
     * Returns the computed style for a property, or an array of properties, as a hash.
     *
     * Building a CSS properties hash this way can be significantly faster than the more convenient, conventional jQuery
     * approach, $( elem ).css( propertiesArray ).
     *
     * ATTN
     * ====
     *
     * We are using an internal jQuery API here: $.css(). The current signature was introduced in jQuery 1.9.0. May
     * break without warning with any change of the minor version.
     *
     * The $.css API is monitored by the tests in api.jquery.css.spec.js and verifies that it works as expected.
     *
     * @param {HTMLElement}     elem
     * @param {string|string[]} properties
     * @param {Object}          [opts]
     * @param {boolean}         [opts.toLowerCase=false]  ensures return values in lower case
     * @param {boolean}         [opts.toFloat=false]      converts return values to numbers, using parseFloat
     *
     * @returns {Object}        property names and their values
     */
    function getCss ( elem, properties, opts ) {
        var i, length, name,
            props = {},
            computedStyles = ( elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow ).getComputedStyle( elem, null );

        opts || ( opts = {} );

        if ( ! $.isArray( properties ) ) properties = [ properties ];
        length = properties.length;

        for ( i = 0; i < length; i++ ) {
            name = properties[i];
            props[name] = $.css( elem, name, false, computedStyles );
            if ( opts.toLowerCase && props[name] && props[name].toLowerCase ) props[name] = props[name].toLowerCase();
            if ( opts.toFloat ) props[name] = parseFloat( props[name] );
        }

        return props;
    }

    /**
     * Calls parseFloat on each value. Useful for removing units from numeric values.
     *
     * @param   {Object} object
     * @returns {Object}
     */
    function toFloat ( object ) {
        var transformed =  {};

        $.map( object, function ( value, key ) {
            transformed[key] =  parseFloat( value );
        } );

        return transformed;
    }

    function isNumber ( value ) {
        // Done as in the Lodash compatibility build, but rejecting NaN as a number.
        var isNumeric = typeof value === 'number' || value && typeof value === 'object' && Object.prototype.toString.call( value ) === '[object Number]' || false;

        // Reject NaN before returning
        return isNumeric && value === +value;
    }

    function isString ( value ) {
        // Done as in the Lodash compatibility build
        return typeof value === 'string' || value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object String]' || false;
    }

}( jQuery || $ ));  // todo best solution?