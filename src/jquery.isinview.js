;( function( $ ) {
    "use strict";

    var _scrollbarWidth,
        _useGetComputedStyle = !! window.getComputedStyle,          // IE8, my dear, this is for you
        _isIOS,
        root = window,
        $root = $( window ),

        /**
         * Returns the true document width, even for edge cases, as opposed to the rough guess $( document ).width()
         * provides. A feature detection is run the first time trueDocumentWidth or trueDocumentHeight is called. See
         * the IIFE at the bottom for details.
         *
         * @type {function (Document): number} */
        trueDocumentWidth,

        /**
         * Returns the true document height.
         *
         * @type {function (Document): number} */
        trueDocumentHeight;


    /**
     * API
     */

    /**
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {boolean|Object|undefined}
     */
    $.fn.hasScrollbar = function ( axis ) {
        return hasScrollbar( this, axis );
    };

    /**
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {number|Object|undefined}
     */
    $.fn.scrollbarWidth = function ( axis ) {
        return effectiveScrollbarWith( this, axis );
    };

    /**
     * @returns {number}
     */
    $.scrollbarWidth = browserScrollbarWidth;

    /**
     * @returns {Window|undefined}
     */
    $.fn.ownerWindow = function () {
        return ownerWindow( this );
    };

    /**
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
     * Internals
     */

    /**
     * Does the actual work of $.fn.hasScrollbar. Protected from external modification. See $.fn.hasScrollbar for
     * details.
     *
     * @param   {jQuery} $elem
     * @param   {string} [axis="both"]  values "horizontal", "vertical", "both"
     * @returns {boolean|Object|undefined}
     */
    function hasScrollbar ( $elem, axis ) {

        var isWindow, isBody, isContentElement, $body,
            overflowPropNames, bodyOverflowPropNames,
            elemProps, bodyProps, windowProps, appliedViewportOverflows,
            innerWidth, innerHeight, scrollWidth, scrollHeight,
            query = {}, result = {}, context = {},
            elem = $elem[0];

        $elem = $elem.eq( 0 );
        axis || ( axis = "both" );

        query.getBoth = axis === "both";
        query.getHorizontal = axis === "horizontal" || query.getBoth;
        query.getVertical = axis === "vertical" || query.getBoth;

        if ( axis !== "horizontal" && axis !== "vertical" && axis !== "both" ) throw new Error( "Invalid parameter value: axis = " + axis );
        if ( ! $elem.length ) return;

        // Transformations:
        // - If called on a window, we need document, documentElement and body, and discard the element
        // - If called on the document or document element, we treat it like a call on window (above)
        // - If called on the body, we need document, documentElement and the body itself (again, we discard the element to avoid ambiguity)
        // - If called on an iframe element, we treat it like a window call, using the iframe content window
        isWindow = $.isWindow( elem );
        if ( isWindow ) {
            context.document = elem.document;
        } else if ( elem.nodeType === 9 ) {
            context.document = elem;
            isWindow = true;
        } else if ( elem === elem.ownerDocument.documentElement ) {
            context.document = elem.ownerDocument;
            isWindow = true;
        } else if ( elem.nodeType === 1 && elem.tagName.toLowerCase() === "iframe" ) {
            context.document = elem.contentDocument || elem.contentWindow.document;
            isWindow = true;
        } else if ( elem === elem.ownerDocument.body ) {
            context.document = elem.ownerDocument;
            isBody = true;
        }

        isContentElement = ! ( isWindow || isBody );

        if ( isWindow || isBody ) {
            context.$document = $( context.document );
            context.documentElement = context.document.documentElement;
            context.body = context.document.body;

            elem = $elem = undefined;       // won't be needed; discard, to avoid ambiguity in the code below
        }

        // Query the overflow settings.
        //
        // - If we deal with an ordinary element, we always need them for both axes, because they interact (one scroll
        //   bar can cause another).
        // - If we deal with window or body scroll bars, we always need the settings for both body and window
        //   (documentElement) because they are interdependent. See getAppliedViewportOverflows().
        overflowPropNames = [ "overflow" ];
        if ( query.getHorizontal || isContentElement ) overflowPropNames.push( "overflowX" );
        if ( query.getVertical || isContentElement ) overflowPropNames.push( "overflowY" );

        if ( isWindow || isBody ) {
            bodyOverflowPropNames = [ "overflow", "position" ];
            if ( query.getHorizontal ) bodyOverflowPropNames.push( "overflowX" );
            if ( query.getVertical ) bodyOverflowPropNames.push( "overflowY" );

            windowProps = getCss( context.documentElement, overflowPropNames, { toLowerCase: true } );
            bodyProps = getCss( context.body, bodyOverflowPropNames, { toLowerCase: true } );
            appliedViewportOverflows = getAppliedViewportOverflows( windowProps, bodyProps );

            windowProps = appliedViewportOverflows.window;

            $.extend( bodyProps, appliedViewportOverflows.body );
            bodyProps.positioned = bodyProps.position === "absolute" || bodyProps.position === "relative";
        } else {
            elemProps = getCss( elem, overflowPropNames, { toLowerCase: true } );
            elemProps = getAppliedOverflows( elemProps, true );
        }

        if ( isWindow ) {

            result = _windowHasScrollbar( windowProps, bodyProps, query, context );

        } else if ( isBody ) {

            // Checking for body scroll bars.
            //
            // body.clientWidth returns the width of the body, minus the scroll bars. We can simply compare it to the
            // full width, provided that the browser displays scroll bars which take up space.
            //
            // By implication, this check DOES NOT work for an effective body overflow of "auto" in browsers which
            // display scroll bars of width 0. (Affects iOS, other mobile browsers, and Safari on OS X when used without
            // an attached mouse.) There simply is no reliable, bullet-proof way to determine the width of the body
            // content, ie the true body scroll width, in those browsers.
            $body = $( context.body );
            if ( query.getHorizontal ) result.horizontal = bodyProps.overflowScrollX || bodyProps.overflowAutoX && context.body.clientWidth < $body.width();
            if ( query.getVertical ) result.vertical = bodyProps.overflowScrollY || bodyProps.overflowAutoY && context.body.clientHeight < $body.height();

        } else {

            // Scroll bars on an ordinary HTML element
            scrollWidth = elem.scrollWidth;
            scrollHeight = elem.scrollHeight;

            result.horizontal = scrollWidth > 0 && ( elemProps.overflowScrollX || elemProps.overflowAutoX && ( innerWidth = $elem.innerWidth() ) < scrollWidth );
            result.vertical = scrollHeight > 0 && ( elemProps.overflowScrollY || elemProps.overflowAutoY && ( innerHeight = $elem.innerHeight() ) < scrollHeight );

            // Detect if the appearance of one scroll bar causes the other to appear, too.
            // todo what if this triggers and overflow is hidden or visible - phantom scroll bar detected? what does scroll height return for these overflow types?
            result.vertical = result.vertical || result.horizontal && innerHeight - browserScrollbarWidth() < scrollHeight;
            result.horizontal = result.horizontal || result.vertical && innerWidth - browserScrollbarWidth() < scrollWidth;

        }

        return query.getBoth ? result : query.getHorizontal ? result.horizontal : result.vertical;
    }

    /**
     * Returns the scroll bar state of the window, based on the prepared properties which are passed in. Handles all
     * edge cases which a body with hidden overflow can cause. Helper for hasScrollbar().
     *
     * @param {Object} windowProps
     * @param {Object} bodyProps
     * @param {Object} query
     * @param {Object} context
     *
     * @returns {{vertical: boolean, horizontal: boolean}}
     */
    function _windowHasScrollbar ( windowProps, bodyProps, query, context ) {

        var bodyRect,
            overflowPropNames = [], bodyOverflowPropNames = [],
            result = {},
            doneX = ! query.getHorizontal,
            doneY = ! query.getVertical;

        // Handle the trivial case first: window set to overflow: scroll.
        if ( ! doneX && windowProps.overflowScrollX ) result.horizontal = doneX = true;
        if ( ! doneY && windowProps.overflowScrollY ) result.vertical = doneY = true;

        bodyProps.obscuresOverflowX = !bodyProps.overflowVisibleX;
        bodyProps.obscuresOverflowY = !bodyProps.overflowVisibleY;

        // The default case: body overflow affects document size (not hidden or tucked away in a scrollable area)
        if ( ! doneX && ! bodyProps.obscuresOverflowX ) bodyProps.rightDocumentEdge = trueDocumentWidth( context.document );
        if ( ! doneY && ! bodyProps.obscuresOverflowY ) bodyProps.bottomDocumentEdge = trueDocumentHeight( context.document );

        // The body obscures its overflow, the document is not enlarged by it. From here on out, we only deal with the
        // implications this special case.
        if ( bodyProps.positioned && ( ! doneX && bodyProps.obscuresOverflowX ) || ( ! doneY && bodyProps.obscuresOverflowY ) ) {
            if ( ! doneX && bodyProps.obscuresOverflowX ) {
                overflowPropNames.push( "marginLeft", "borderLeftWidth", "paddingLeft", "marginRight", "borderRightWidth", "paddingRight" );
                bodyOverflowPropNames.push( "left", "marginLeft", "marginRight" );
            }

            if ( ! doneY && bodyProps.obscuresOverflowY ) {
                overflowPropNames.push( "marginTop", "borderTopWidth", "paddingTop", "marginBottom", "borderBottomWidth", "paddingBottom" );
                bodyOverflowPropNames.push( "top", "marginTop", "marginBottom" );
            }

            $.extend( bodyProps, getCss( context.body, bodyOverflowPropNames, { toFloat: true } ) );
            $.extend( windowProps, getCss( context.documentElement, overflowPropNames, { toFloat: true } ) );
            bodyRect = getBoundingClientRectCompat( context.body );
        }

        if ( ! doneX && bodyProps.obscuresOverflowX ) {

            if ( bodyProps.positioned ) {

                windowProps.leftOffsets = windowProps.marginLeft + windowProps.borderLeftWidth + windowProps.paddingLeft;
                windowProps.horizontalOffsets = windowProps.leftOffsets + windowProps.marginRight + windowProps.borderRightWidth + windowProps.paddingRight;
                bodyProps.horizontalMargins = bodyProps.marginLeft + bodyProps.marginRight;

                // If the body is positioned, it is the offset parent of all content, hence every overflow is obscured.
                // Scroll bars would only appear if
                //
                // - the window (documentElement) is set to overflow: scroll - we have already handled that case
                // - the window is set to overflow: auto, and the body itself, plus padding etc on body and window,
                //   does not fit into the viewport.
                bodyProps.definesRightDocumentEdge = true;

                if ( bodyProps.position === "relative" ) {
                    bodyProps.rightDocumentEdge = Math.max(
                        // Normal, unpositioned edge
                        bodyRect.width + bodyProps.horizontalMargins + windowProps.horizontalOffsets,
                        // Edge when positioned, includes "left" shift, ignores _right_ window padding etc which stays in place.
                        bodyRect.width + bodyProps.horizontalMargins + bodyProps.left + windowProps.leftOffsets
                    );
                } else {
                    // Position "absolute"
                    bodyProps.rightDocumentEdge = bodyProps.left + bodyRect.width + bodyProps.horizontalMargins;
                }

            } else {
                // If the body is not positioned, we have to make an expensive, unwelcome call to trueDocumentWidth()
                // (see comment at IIFE, at the bottom of the file). There is no other, implicit way to figure out
                // if scroll bars appear (at least not one that works cross-browser).
                //
                // The impact is not quite that bad, though, because the window and body overflows already match
                // those required for the feature detection in trueDocumentWidth/Height. So the overflows don't have
                // to be switched around, which is potentially buggy and could cause display issues in some browsers.
                bodyProps.rightDocumentEdge = trueDocumentWidth( context.document );
            }

        }

        // See above, bodyOverflowHiddenX branch, for documentation.
        if ( ! doneY && bodyProps.obscuresOverflowY ) {

            if ( bodyProps.positioned ) {

                windowProps.topOffsets = windowProps.marginTop + windowProps.borderTopWidth + windowProps.paddingTop;
                windowProps.verticalOffsets = windowProps.topOffsets + windowProps.marginBottom + windowProps.borderBottomWidth + windowProps.paddingBottom;
                bodyProps.verticalMargins = bodyProps.marginTop + bodyProps.marginBottom;

                if ( bodyProps.position === "relative" ) {
                    bodyProps.bottomDocumentEdge = Math.max(
                        // Normal, unpositioned edge
                        bodyRect.height + bodyProps.verticalMargins + windowProps.verticalOffsets,
                        // Edge when positioned, includes "top" shift, ignores _bottom_ window padding etc which stays in place.
                        bodyRect.height + bodyProps.verticalMargins + bodyProps.top + windowProps.topOffsets
                    );
                } else {
                    // Position "absolute"
                    bodyProps.bottomDocumentEdge = bodyProps.top + bodyRect.height + bodyProps.verticalMargins;
                }

            } else {
                bodyProps.bottomDocumentEdge =  trueDocumentHeight( context.document );
            }

        }

        if ( ! doneX ) result.horizontal = windowProps.overflowAutoX && context.documentElement.clientWidth < bodyProps.rightDocumentEdge;
        if ( ! doneY ) result.vertical = windowProps.overflowAutoY && context.documentElement.clientHeight < bodyProps.bottomDocumentEdge;

        return result;

    }

    /**
     * Does the actual work of $.scrollbarWidth. Protected from external modification. See $.scrollbarWidth for details.
     *
     * Adapted from Ben Alman's scrollbarWidth plugin. See
     * - http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
     * - http://jsbin.com/zeliy/1
     *
     * @returns {number}
     */
    function browserScrollbarWidth () {
        var $parent, $child;

        if ( _scrollbarWidth === undefined ) {

            // todo simplify, remove the child, set parent to overflow:scroll, measure parent.offsetWidth - parent.clientWidth (rename parent to testEl); see Modernizr approach at https://github.com/Modernizr/Modernizr/blob/7bf3046835e4c97e1d5e98f6933288b80e8e7cb8/feature-detects/hiddenscroll.js
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

        if ( opts.tolerance !== undefined ) {
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
     * @returns {ClientRect}
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
     * Determines the effective overflow setting of an element, separately for each axis, based on the `overflow`,
     * `overflowX` and `overflowY` properties of the element which must be passed in as a hash.
     *
     * Returns a hash of the computed results for overflowX, overflowY. Also adds boolean status properties to the hash
     * if the createBooleans flag is set. These are properties for mere convenience. They signal if a particular
     * overflow type applies (e.g. overflowHiddenX = true/false).
     *
     * ATTN The method does not take the special relation of body and documentElement into account. That is handled by
     * the more specific getAppliedViewportOverflows() function.
     *
     * The effective overflow setting is established as follows:
     *
     * - If a computed value for `overflow(X/Y)` exists, it gets applied to the axis.
     * - If not, the computed value of the general `overflow` setting gets applied to the axis.
     * - If there is no computed value at all, the overflow default gets applied to the axis. The default is
     *   "visible" in seemingly every browser out there. Falling back to the default should never be necessary,
     *   though, because there always is a computed value.
     *
     * @param {Object}        props            hash of element properties (computed values)
     * @param {string}        props.overflow
     * @param {string}        props.overflowX
     * @param {string}        props.overflowY
     * @param {boolean=false} createBooleans   if true, create the full set of boolean status properties, e.g.
     *                                         overflowVisibleX (true/false), overflowHiddenY (true/false) etc
     * @returns {AppliedOverflow}              hash of the computed results: overflowX, overflowY, optional boolean
     *                                         status properties
     */
    function getAppliedOverflows ( props, createBooleans ) {
        var status = {};

        // Establish the applied overflow (e.g. overflowX: "scroll")
        status.overflowX = props.overflowX || props.overflow || "visible";
        status.overflowY = props.overflowY || props.overflow || "visible";

        // Create the derived boolean status properties (e.g overflowScrollX: true)
        if ( createBooleans ) {
            $.each( [ "Visible", "Auto", "Scroll", "Hidden" ], function ( index, type ) {
                var lcType = type.toLowerCase();
                status["overflow" + type + "X"] = status.overflowX === lcType;
                status["overflow" + type + "Y"] = status.overflowY === lcType;
            } );
        }

        return status;
    }

    /**
     * Determines the effective overflow setting of the viewport and body, separately for each axis, based on the
     * `overflow`, `overflowX` and `overflowY` properties of the documentElement and body which must be passed in as a
     * hash.
     *
     * Returns the results for viewport and body in an aggregated `{ window: ..., body: ...}` hash.
     *
     * For the basic resolution mechanism, see getAppliedOverflows(). When determining the effective overflow, the
     * peculiarities of viewport and body are taken into account:
     *
     * - Viewport and body overflows are interdependent. If the nominal viewport overflow for a given axis is "visible",
     *   the viewport inherits the body overflow for that axis, and the body overflow is set to "visible". Curiously,
     *   that transfer is _not_ reflected in the computed values, it just manifests in behaviour.
     *
     * - Once that is done, if the viewport overflow is still "visible" for an axis, it is effectively turned into
     *   "auto". Scroll bars appear when the content overflows the viewport (ie, "auto" behaviour). Hence, this function
     *   will indeed report "auto". Again, the transformation is only manifest in behaviour, not in the computed values.
     *
     * - In iOS, if the effective overflow setting of the viewport is "hidden", it is ignored and treated as "auto".
     *   Content can still overflow the viewport, and scroll bars appear as needed.
     *
     *   Now, the catch. This behaviour is impossible to feature-detect. The computed values are not at all affected by
     *   it, and the results reported eg. for clientHeight, offsetHeight, scrollHeight of body and documentElement do
     *   not differ between Safari on iOS and, say, Chrome. The numbers don't give the behaviour away.
     *
     *   So we have to resort to browser sniffing here. It sucks, but there is literally no other option.
     *
     * NB Additional status properties (see getAppliedOverflows) are always generated here.
     *
     * @param {Object} documentElementProps            hash of documentElement properties (computed values)
     * @param {string} documentElementProps.overflow
     * @param {string} documentElementProps.overflowX
     * @param {string} documentElementProps.overflowY
     *
     * @param {Object} bodyProps                       hash of body properties (computed values)
     * @param {string} bodyProps.overflow
     * @param {string} bodyProps.overflowX
     * @param {string} bodyProps.overflowY
     *
     * @returns {{window: AppliedOverflow, body: AppliedOverflow}}
     */
    function getAppliedViewportOverflows ( documentElementProps, bodyProps ) {
        var _window = getAppliedOverflows( documentElementProps, false ),
            body = getAppliedOverflows( bodyProps, false ),
            consolidated = { window: {}, body: {} };

        // Handle the interdependent relation between body and window (documentElement) overflow
        if ( _window.overflowX === "visible" ) {
            // If the window overflow is set to "visible", body props get transferred to the window, body changes to
            // "visible". (Nothing really changes if both are set to "visible".)
            consolidated.body.overflowX = "visible";
            consolidated.window.overflowX = body.overflowX;
        } else {
            // No transfer of properties.
            // - If body overflow is "visible", it remains that way, and the window stays as it is.
            // - If body and window are set to properties other than "visible", they keep their divergent settings.
            consolidated.body.overflowX = body.overflowX;
            consolidated.window.overflowX = _window.overflowX;
        }

        // Repeat for overflowY
        if ( _window.overflowY === "visible" ) {
            consolidated.body.overflowY = "visible";
            consolidated.window.overflowY = body.overflowY;
        } else {
            consolidated.body.overflowY = body.overflowY;
            consolidated.window.overflowY = _window.overflowY;
        }

        // window.overflow(X/Y): "visible" actually means "auto" because scroll bars appear as needed; transform
        if ( consolidated.window.overflowX === "visible" ) consolidated.window.overflowX = "auto";
        if ( consolidated.window.overflowY === "visible" ) consolidated.window.overflowY = "auto";

        // In iOS, window.overflow(X/Y): "hidden" actually means "auto"; transform
        if ( isIOS() ) {
            if ( consolidated.window.overflowX === "hidden" ) consolidated.window.overflowX = "auto";
            if ( consolidated.window.overflowY === "hidden" ) consolidated.window.overflowY = "auto";
        }

        // Add the boolean status properties to the result
        consolidated.window = getAppliedOverflows( consolidated.window, true );
        consolidated.body = getAppliedOverflows( consolidated.body, true );

        return consolidated;
    }

    /**
     * Establishes the container and returns it in a jQuery wrapper.
     *
     * Resolves and normalizes the input, which may be a document, HTMLElement, window, or selector string. Corrects
     * likely mistakes, such as passing in a document or an iframe, rather than the corresponding window.
     *
     * @param {Window|Document|HTMLElement|HTMLIFrameElement|jQuery|string} container
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

        if ( opts.tolerance !== undefined ) {
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
            _window = ( elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow ),
            computedStyles = _useGetComputedStyle ? _window.getComputedStyle( elem, null ) : elem.currentStyle;

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
     * Returns the bounding client rect, including width and height properties. For compatibility with IE8, which
     * supports getBoundingClientRect but doesn't calculate width and height.
     *
     * Use only when width and height are actually needed.
     *
     * Will be removed when IE8 support is dropped entirely.
     *
     * @param   {HTMLElement} elem
     * @returns {ClientRect}
     */
    function getBoundingClientRectCompat ( elem ) {
        var elemRect = elem.getBoundingClientRect();

        if ( elemRect.width === undefined || elemRect.height === undefined ) {
            // Fix for IE8
            elemRect = {
                top: elemRect.top,
                left: elemRect.left,
                bottom: elemRect.bottom,
                right: elemRect.right,
                width:  elemRect.right - elemRect.left,
                height: elemRect.bottom - elemRect.top
            };
        }

        return elemRect;
    }

    /**
     * Detects if the browser is on iOS. Works for Safari as well as other browsers, say, Chrome on iOS.
     *
     * Required for some iOS behaviour which can't be feature-detected in any way.
     *
     * @returns {boolean}
     */
    function isIOS () {
        if ( _isIOS === undefined ) _isIOS = (/iPad|iPhone|iPod/g).test( navigator.userAgent );
        return _isIOS;
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

    /**
     * Returns whether or not a value is of type number. Also rejects NaN as a number.
     *
     * NB This is not the same as $.isNumeric because $.isNumeric( "3" ) is true while isNumber( "3" ) is false.
     *
     * @param {*} value
     * @returns {boolean}
     */
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

    // IIFE generating the trueDocumentWidth and trueDocumentHeight functions.
    //
    // These functions need to run a feature detection which requires insertion of an iframe. The body element in the
    // main document must be available when that happens (ie, the opening body tag must have been parsed). For that
    // reason, the detection does not run up front - after all, the code might be loaded and run while parsing the head.
    // Instead, detection happens when either trueDocumentWidth or trueDocumentHeight is invoked for the first time.
    // Given their purpose, they won't be called until after the opening body tag has been parsed.

    (function () {
        var elementNameForDocSizeQuery;

        trueDocumentWidth = function ( document ) {
            if ( elementNameForDocSizeQuery === undefined ) testDocumentScroll();
            return document[elementNameForDocSizeQuery].scrollWidth;
        };

        trueDocumentHeight = function ( document ) {
            if ( elementNameForDocSizeQuery === undefined ) testDocumentScroll();
            return  document[elementNameForDocSizeQuery].scrollHeight;
        };

        /**
         * Detects which element to use for a document size query (body or documentElement).
         *
         * Sandbox
         * -------
         *
         * The detection is sandboxed in an iframe element created for the purpose. If the iframe window can't be
         * accessed because of some obscure policy restriction or browser bug, the main window and document is used
         * as a fallback.
         *
         * The test is designed to minimize the visual and rendering impact in the test window, in case the fallback
         * should ever be used.
         *
         * Test method
         * -----------
         *
         * We can't test directly which call to use (at least not with an even worse amount of intervention than is
         * already the case, which matters if the iframe is not accessible). But we can work by exclusion.
         *
         * In Chrome (desktop and mobile), Safari (also iOS), and Opera, body.scrollWidth returns the true document
         * width. In Firefox and IE, body.scrollWidth responds to the body content size instead. In those browsers,
         * true document width is returned by document.documentElement.scrollWidth.
         *
         * So we test the behaviour of body.scrollWidth by manipulating the body size, while keeping the document size
         * constant.
         *
         * - We prepare for the test by making sure the body does not display its overflow.
         * - Then we inject a small test element into the body and give it a relative position far outside the viewport.
         *
         * The body size is expanded, but the document size remains unaffected because the body hides the overflowing
         * test element (either outright, or by putting it in a hidden part of the scroll pane). Then we check if
         * body.scrollWidth has responded to the change. From that, we infer the right element to use for a document
         * width query.
         *
         * The function does not return anything. It sets the elementNameForDocSizeQuery in the closure instead.
         */
        function testDocumentScroll () {

            var iframe = createTestIframe(),
                _document = iframe && iframe.contentDocument || document,
                _testEl, initialScrollWidth, responds,
                _$documentElement = $( _document.documentElement ),
                _body = _document.body,
                _$body = $( _body ),
                documentElementOverflowX = ( _$documentElement.css( "overflowX" ) || _$documentElement.css ( "overflow" ) || "visible" ).toLowerCase(),
                bodyOverflowX = ( _$body.css( "overflowX" ) || _$body.css ( "overflow" ) || "visible" ).toLowerCase(),
                modifyBody = bodyOverflowX !== "hidden",
                modifyWindow = documentElementOverflowX === "visible";

            // Create a test element which will be used to to expand the body content way to the right.
            _testEl = _document.createElement( "div" );
            _testEl.style.cssText = "width: 1px; height: 1px; position: relative; top: 0px; left: 32000px;";

            // Make sure that the body (but not the window) hides its overflow
            if ( modifyWindow ) _$documentElement.css( { overflowX: "auto" } );
            if ( modifyBody ) _$body.css( { overflowX: "hidden" } );

            // Inject the test element, then test if the body.scrollWidth property responds
            initialScrollWidth = _body.scrollWidth;
            _body.appendChild( _testEl );
            responds = initialScrollWidth !== _body.scrollWidth;
            _body.removeChild( _testEl );

            // Restore the overflow settings for window and body
            if ( modifyWindow ) _$documentElement.css( { overflowX: documentElementOverflowX } );
            if ( modifyBody ) _$body.css( { overflowX: bodyOverflowX } );

            // If body.scrollWidth responded, it reacts to body content size, not document size. Default to
            // ddE.scrollWidth. If it did not react, however, it is linked to the (unchanged) document size.
            elementNameForDocSizeQuery = responds ? "documentElement" : "body";

            document.body.removeChild( iframe );

        }

        /**
         * Creates an iframe document with an HTML5 doctype and UTF-8 encoding and positions it off screen. Window size
         * is 500px x 500px. Body and window (document element) are set to overflow: hidden.
         *
         * In case the content document of the iframe can't be accessed for some reason, the function returns undefined.
         * This is unlikely to ever happen, though.
         *
         * @returns {HTMLIFrameElement|undefined}
         */
        function createTestIframe () {
            var iframe = document.createElement( "iframe" ),
                body = document.body;

            iframe.style.cssText = "position: absolute; top: -600px; left: -600px; width: 500px; height: 500px; margin: 0px; padding: 0px; border: none;";
            iframe.frameborder = "0";

            body.appendChild( iframe );
            iframe.src = 'about:blank';

            if ( ! iframe.contentDocument ) return;

            iframe.contentDocument.write( '<!DOCTYPE html><html><head><meta charset="UTF-8"><title></title><style type="text/css">html, body { overflow: hidden; }</style></head><body></body></html>' );

            return iframe;
        }

    })();

    /**
     * Custom types.
     *
     * For easier documentation and type inference.
     */

    /**
     * @name  AppliedOverflow
     * @type  {Object}
     *
     * @property {string}  overflowX
     * @property {string}  overflowY
     * @property {boolean} overflowVisibleX
     * @property {boolean} overflowVisibleY
     * @property {boolean} overflowAutoX
     * @property {boolean} overflowAutoY
     * @property {boolean} overflowScrollX
     * @property {boolean} overflowScrollY
     * @property {boolean} overflowHiddenX
     * @property {boolean} overflowHiddenY
     */


}( jQuery || $ ));  // todo best solution?