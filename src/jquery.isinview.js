;( function( $ ) {
    "use strict";

    var _scrollbarWidth,
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
    };

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

        var config,
            $elems = this,
            inView = [];

        if ( !$elems.length ) return $();

        config = _prepareConfig( $elems, container, opts );

        // Check if the elements are children of the container. For performance reasons, only the first element is
        // examined.
        checkHierarchy( $elems[0], config.container );

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
        return this.inView( this.ownerWindow(), opts );
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

        var config,
            $elem = this,
            elem = this[0];

        if ( !$elem.length ) return false;

        config = _prepareConfig( $elem, container, opts );
        checkHierarchy( elem, config.container );

        return _isInView( elem, config );

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
        return this.isInView( this.ownerWindow(), opts );
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

        container || ( container = $elem.ownerWindow() );
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

        var viewportWidth, viewportHeight, hTolerance, vTolerance, rect,
            container = config.container,
            $container = config.$container,
            cache = config.cache,
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

        if ( config.useHorizontal ) viewportWidth = cache.viewportWidth || ( cache.viewportWidth = getContainerWidth( $container, config.containerIsWindow ) );
        if ( config.useVertical ) viewportHeight = cache.viewportHeight || ( cache.viewportHeight = getContainerHeight( $container, config.containerIsWindow ) );

        // Convert tolerance to a px value (if given as a percentage)
        hTolerance = cache.hTolerance || ( cache.hTolerance = config.toleranceType === "add" ? config.tolerance : viewportWidth * config.tolerance );
        vTolerance = cache.vTolerance || ( cache.vTolerance = config.toleranceType === "add" ? config.tolerance : viewportHeight * config.tolerance );

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
            if ( config.useVertical ) isInView = rect.top < viewportHeight + vTolerance && rect.bottom > -vTolerance;
            if ( config.useHorizontal ) isInView = isInView && rect.left < viewportWidth + hTolerance && rect.right > -hTolerance;
        } else {
            if ( config.useVertical ) isInView = rect.top >= -vTolerance && rect.top < viewportHeight + vTolerance && rect.bottom > -vTolerance && rect.bottom <= viewportHeight + vTolerance;
            if ( config.useHorizontal ) isInView = isInView && rect.left >= -hTolerance && rect.left < viewportWidth + hTolerance && rect.right > -hTolerance && rect.right <= viewportWidth + hTolerance;
        }

        return isInView;

    }

    /**
     * Gets the TextRectangle coordinates relative to a container element.
     *
     * Do not call if the container is a window (redundant) or a document. Both calls would fail.
     */
    function getRelativeRect ( rect, $container, cache ) {
        var containerRect,
            relativeRectCorrections,
            containerProps;

        if ( cache && cache.relativeRectCorrections ) {

            relativeRectCorrections = cache.relativeRectCorrections;

        } else {
            // gBCR coordinates enclose padding, and leave out margin. That is perfect for scrolling because
            //
            // - padding scrolls (ie,o it is part of the scrollable area, and gBCR puts it inside)
            // - margin doesn't scroll (ie, it pushes the scrollable area to another position, and gBCR records that)
            //
            // Borders, however, don't scroll, so they are not part of the scrollable area - but gBCR puts them inside.
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
            computedStyles = window.getComputedStyle( elem ),
            props = {
                borderTopWidth: $.css( elem, "borderTopWidth", false, computedStyles ),
                borderRightWidth: $.css( elem, "borderRightWidth", false, computedStyles ),
                borderBottomWidth: $.css( elem, "borderBottomWidth", false, computedStyles ),
                borderLeftWidth: $.css( elem, "borderLeftWidth", false, computedStyles ),
                paddingTop: $.css( elem, "paddingTop", false, computedStyles ),
                paddingRight: $.css( elem, "paddingRight", false, computedStyles ),
                paddingBottom: $.css( elem, "paddingBottom", false, computedStyles ),
                paddingLeft: $.css( elem, "paddingLeft", false, computedStyles )
            };

        // NB Building the props object this way is significantly faster than the more convenient, conventional jQuery
        // approach:
        //
        //    props = $( elem ).css( [
        //        "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
        //        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"
        //    ] );

        props = toFloat( props );

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
     * Gets the width of a jQuery-wrapped container. Use it instead of $container.width(). Supports quirks mode for
     * windows, unlike jQuery.
     *
     * @param {jQuery}  $container
     * @param {boolean} isWindow    required to speed up the process
     * @returns {number}
     */
    function getContainerWidth ( $container, isWindow ) {
        return isWindow ? getWindowDimension( $container, "Width" ) : $container.width();
    }

    /**
     * Gets the height of a jQuery-wrapped container. Use it instead of $container.height(). Supports quirks mode for
     * windows, unlike jQuery.
     *
     * @param {jQuery}  $container
     * @param {boolean} isWindow    required to speed up the process
     * @returns {number}
     */
    function getContainerHeight ( $container, isWindow ) {
        return isWindow ? getWindowDimension( $container, "Height" ) : $container.height();
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