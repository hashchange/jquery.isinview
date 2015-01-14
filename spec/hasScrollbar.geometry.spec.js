/*global describe, it */
(function () {
    "use strict";

    describe( '$.fn.hasScrollbar: Geometry', function () {

        /** @type {DOMFixture}  populated by Setup.create() */
        var f;

        afterEach( function () {
            f.cleanDom();
        } );

        after( function () {
            f.shutdown();
        } );

        describe( 'Window', function () {

            var $window, $documentElement, $body, viewportWidth, viewportHeight;

            beforeEach( function () {
                f = Setup.create( "window", f );

                return f.ready.done( function () {
                    $window = $( window );
                    $documentElement = $( document.documentElement );
                    $body = $( "body" ).contentOnly();
                    viewportWidth = $window.width();
                    viewportHeight = $window.height();
                } );
            } );

            describe( 'It a detects a vertical scroll bar, and not a horizontal one', function () {

                it( 'when the body content is longer than the viewport height', function () {
                    f.$el.height( viewportHeight + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body fits inside the viewport vertically, but the document does not', function () {
                    // This happens, for instance, when an absolutely positioned element extends off screen. The
                    // positioned element does not enlarge the body (assuming the body is not positioned itself).
                    f.$el.positionAt( 0, 0 ).height( viewportHeight + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body is set to overflow:hidden and fits inside the viewport vertically, but absolutely positioned content in the document does not', function () {
                    // The positioned element does not enlarge the body (assuming the body is not positioned itself). So
                    // the overflow:hidden setting on the body is in fact irrelevant, a scroll bar still appears.
                    f.$el.positionAt( 0, 0 ).height( viewportHeight + 1 );
                    $body.overflow( "hidden" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has a top margin', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.topMargin( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has a bottom margin', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.bottomMargin( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has top padding', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.topPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has bottom padding', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.bottomPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has top padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    f.applyBorderBox();
                    f.$el.height( viewportHeight );
                    $body.topPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has bottom padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    f.applyBorderBox();
                    f.$el.height( viewportHeight );
                    $body.bottomPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has a top border', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.topBorder( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the body content is exactly as high as the viewport, and the body has a bottom border', function () {
                    // ... and nothing else.
                    f.$el.height( viewportHeight );
                    $body.bottomBorder( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                if( $.scrollbarWidth() === 0 ) {

                    it( 'when the body is as wide as the viewport without scroll bars, and extends a bit beyond it vertically (in browsers with scroll bar width 0)', function () {
                        // Normally, the vertical scroll bar would obscure part of the body and force a horizontal
                        // scroll bar as well, but with width 0 it doesn't.
                        f.$el.contentBox( viewportWidth, viewportHeight + 1 );
                        expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                    } );

                }

                it( 'when body and content fit inside the viewport, but the documentElement is set to overflow-y: scroll', function () {
                    f.$el.remove();
                    $documentElement.overflowY( "scroll" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

            } );

            describe( 'It a detects a horizontal scroll bar, and not a vertical one', function () {

                it( 'when the body is wider than the viewport width', function () {
                    $body.width( viewportWidth + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body content is wider than the viewport width', function () {
                    f.$el.width( viewportWidth + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body fits inside the viewport horizontally, but the document does not', function () {
                    // This happens, for instance, when an absolutely positioned element extends off screen. The
                    // positioned element does not enlarge the body (assuming the body is not positioned itself).
                    f.$el.positionAt( 0, 0 ).width( viewportWidth + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body is set to overflow:hidden and fits inside the viewport horizontally, but absolutely positioned content in the document does not', function () {
                    // The positioned element does not enlarge the body (assuming the body is not positioned itself). So
                    // the overflow:hidden setting on the body is in fact irrelevant, a scroll bar still appears.
                    f.$el.positionAt( 0, 0 ).width( viewportWidth + 1 );
                    $body.overflow( "hidden" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has a left margin', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.leftMargin( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has left padding', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.leftPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has left padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    f.applyBorderBox();
                    f.$el.width( viewportWidth );
                    $body.leftPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has a left border', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.leftBorder( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                if( $.scrollbarWidth() === 0 ) {

                    it( 'when the body is as high as the viewport without scroll bars, and extends a bit beyond it horizontally (in browsers with scroll bar width 0)', function () {
                        // Normally, the horizontal scroll bar would obscure part of the body and force a vertical
                        // scroll bar as well, but with width 0 it doesn't.
                        f.$el.contentBox( viewportWidth + 1, viewportHeight );
                        expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                    } );

                }

                it( 'when body and content fit inside the viewport, but the documentElement is set to overflow-x: scroll', function () {
                    f.$el.remove();
                    $documentElement.overflowX( "scroll" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

            } );

            describe( 'It detects a vertical and horizontal scroll bar', function () {

                it( 'when the body content is wider and higher than the viewport', function () {
                    f.$el.contentBox( viewportWidth + 1, viewportHeight + 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                if ( $.scrollbarWidth() > 0 ) {

                    it( 'when the body is as wide as the viewport without scroll bars, and extends a bit beyond it vertically', function () {
                        // The vertical scroll bar obscures part of the body and forces a horizontal scroll bar.
                        f.$el.contentBox( viewportWidth, viewportHeight + 1 );
                        expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                    } );

                    it( 'when the body is as high as the viewport without scroll bars, and extends a bit beyond it horizontally', function () {
                        // The horizontal scroll bar obscures part of the body and forces a vertical scroll bar.
                        f.$el.contentBox( viewportWidth + 1, viewportHeight );
                        expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                    } );

                }

                it( 'when body and content fit inside the viewport, but the documentElement is set to overflow:scroll', function () {
                    f.$el.remove();
                    $documentElement.overflow( "scroll" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

            } );

            describe( 'It does not detect a scroll bar', function () {

                it( 'when the body content fits inside the viewport', function () {
                    f.$el.contentBox( viewportWidth, viewportHeight );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when an element is positioned off screen in a scrollable direction, but with display:none', function () {
                    f.$el.positionAt( viewportHeight + 1, viewportWidth + 1 ).css( { display: "none" } );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content extends beyond the viewport horizontally and vertically, but the body is set to overflow: hidden', function () {
                    // NB Opera: This test fails (Opera 12.17) because of what looks like a bug in Opera. Is allowed to
                    // fail in Opera (and Opera only!), then.
                    f.$el.contentBox( viewportWidth + 1, viewportHeight + 1 );
                    $body.overflow( "hidden" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content extends beyond the viewport horizontally and vertically, but the documentElement is set to overflow: hidden', function () {
                    f.$el.contentBox( viewportWidth + 1, viewportHeight + 1 );
                    $documentElement.overflow( "hidden" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when an element is positioned absolutely and extends beyond the viewport horizontally and vertically, but the documentElement is set to overflow: hidden', function () {
                    // The body is not positioned and thus is not the offset parent of the element - the documentElement
                    // is.
                    f.$el.contentBox( viewportWidth + 1, viewportHeight + 1 );
                    $documentElement.overflow( "hidden" );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has a right margin', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.rightMargin( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has right padding', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.rightPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has right padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    f.applyBorderBox();
                    f.$el.width( viewportWidth );
                    $body.rightPadding( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the body content is exactly as wide as the viewport, and the body has a right border', function () {
                    // ... and nothing else.
                    f.$el.width( viewportWidth );
                    $body.rightBorder( 1 );
                    expect( $window.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

            } );

        } );

        describe( 'Document', function () {

            var $window, viewportHeight;

            beforeEach( function () {
                f = Setup.create( "window", f );

                return f.ready.done( function () {
                    $window = $( window );
                    viewportHeight = $window.height();
                } );
            } );

            it( 'When it is called on the document, it returns the result for window scroll bars instead', function () {
                // We expand the body beyond the viewport vertically only, and verify that the returned result matches
                // that of the window.
                f.$el.height( viewportHeight + 1 );
                expect( $( document ).hasScrollbar() ).to.eql( $window.hasScrollbar() );
            } );

        } );

        describe( 'Document element', function () {

            var $window, viewportHeight;

            beforeEach( function () {
                f = Setup.create( "window", f );

                return f.ready.done( function () {
                    $window = $( window );
                    viewportHeight = $window.height();
                } );
            } );

            it( 'When it is called on the document element, it returns the result for window scroll bars instead', function () {
                // We expand the body beyond the viewport vertically only, and verify that the returned result matches
                // that of the window.
                f.$el.height( viewportHeight + 1 );
                expect( $( document.documentElement ).hasScrollbar() ).to.eql( $window.hasScrollbar() );
                expect( $( "html" ).hasScrollbar() ).to.eql( $window.hasScrollbar() );
            } );

        } );

        describe( 'Body tag', function () {

            var $window, $body, viewportWidth, viewportHeight;

            beforeEach( function () {
                f = Setup.create( "window", f );

                return f.ready.done( function () {
                    $window = $( window );
                    $body = $( "body" ).contentOnly();
                    viewportWidth = $window.width();
                    viewportHeight = $window.height();
                } );
            } );

            it( 'When it is called on the body tag, it returns the result for the body tag itself, not the window', function () {
                // We verify this by fitting the body inside the viewport, so that the viewport does not have scroll
                // bars. But the body itself has, because we set it to overflow:scroll.
                $body
                    .contentBox( viewportWidth - 30, viewportHeight - 30 )
                    .overflow( "scroll" );

                expect( $body.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
            } );

        } );

        describe( 'Element with overflow: auto', function () {

            var containerWidth, containerHeight, $content;

            beforeEach( function () {
                f = Setup.create( "overflowAuto", f );

                return f.ready.done( function () {
                    containerWidth = f.$container.width();
                    containerHeight = f.$container.height();
                    $content = f.$el;
                } );
            } );

            describe( 'It a detects a vertical scroll bar, and not a horizontal one', function () {

                it( 'when the content is longer than the element height', function () {
                    $content.height( containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the content is exactly as high as the visible area inside the element, and the element has top padding', function () {
                    // ... and nothing else.
                    //
                    // The top padding pushes down the content.
                    var padding = 1;
                    f.$container.topPadding( padding );
                    $content.height( containerHeight + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                // Removed tests:
                //
                // - when the content is exactly as high as the visible area inside the element, and the element has bottom padding
                // - when the content is exactly as high as the visible area inside the element, and the element has bottom padding (box-sizing: border-box)
                //
                // These tests presume that the bottom padding is pushed down by the content, causing scroll bars to
                // appear. But the actual behaviour is inconsistent across browsers. Padding is pushed down in Chrome
                // and Safari. In FF, IE, and Opera, the padding is squashed, and scroll bars don't appear.
                //
                // See http://jsbin.com/lokavo/9/ for an illustration.

                it( 'when the content is exactly as high as the visible area inside the element, and the element has top padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    //
                    // The top padding pushes down the content.
                    var padding = 1;
                    f.applyBorderBox();
                    f.$container
                        .topPadding( padding )
                        .contentBox( containerWidth, containerHeight );

                    $content.height( containerHeight + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the element has a bottom border, and the content extends into the it, but not beyond it', function () {
                    // ... and nothing else.
                    var border = 1;
                    f.$container.bottomBorder( border );
                    $content.height( containerHeight + border );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the content is exactly as high as the element would be without a border, but the element does have a top border', function () {
                    // ... and nothing else.
                    //
                    // The top border reduces the visible area inside the element and pushes down the content.
                    var border = 1;
                    f.$container.topBorder( border );
                    $content.height( containerHeight + border );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                if ( $.scrollbarWidth() === 0 ) {

                    it( 'when the content is as wide as the element without scroll bars, and extends a bit beyond it vertically (in browsers with scroll bar width 0)', function () {
                        // Normally, the vertical scroll bar would obscure part of the content area inside the element
                        // and force a horizontal scroll bar as well, but with width 0 it doesn't.
                        $content.contentBox( containerWidth, containerHeight + 1 );
                        expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                    } );

                }

                it( 'when the content is wider and higher than the element, and the element is set to overflow-x: hidden, overflow-y: auto', function () {
                    // NB When overflow-x or overflow-y has been set to a value !== "visible" in one dimension, the
                    // other dimension defaults to "auto" and can't be set to "visible" any more.
                    f.$container
                        .overflow( "" )
                        .overflowX( "hidden" )
                        .overflowY( "auto" );

                    $content.contentBox( containerWidth +1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

            } );

            describe( 'It a detects a horizontal scroll bar, and not a vertical one', function () {

                it( 'when the content is wider than the element width', function () {
                    $content.width( containerWidth + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content is exactly as wide as the visible area inside the element, and the element has left padding', function () {
                    // ... and nothing else.
                    //
                    // The left padding pushes the content to the right.
                    var padding = 1;
                    f.$container.leftPadding( padding );
                    $content.width( containerWidth + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content is exactly as wide as the visible area inside the element, and the element has left padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    //
                    // The left padding pushes the content to the right.
                    var padding = 1;
                    f.applyBorderBox();
                    f.$container
                        .leftPadding( padding )
                        .width( containerWidth );

                    $content.width( containerWidth + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content is just 1px wider than the visible area inside the element, and the element has right padding', function () {
                    // ... and nothing else.
                    //
                    // The right padding is squashed by the content, not pushed out. The scroll bar only appears because
                    // the content extends even beyond the right padding. Here, we verify that a scroll bar is detected
                    // immediately once that threshold is passed.
                    var padding = 1;
                    f.$container.rightPadding( padding );
                    $content.width( containerWidth + padding + 1 );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content is just 1px wider than the visible area inside the element, and the element has right padding (box-sizing: border-box)', function () {
                    // ... and nothing else.
                    //
                    // The right padding is squashed by the content, not pushed out. The scroll bar only appears because
                    // the content extends even beyond the right padding. Here, we verify that a scroll bar is detected
                    // immediately once that threshold is passed.
                    var padding = 1;
                    f.applyBorderBox();
                    f.$container
                        .rightPadding( padding )
                        .width( containerWidth );

                    $content.width( containerWidth + padding + 1 );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );


                it( 'when the element has a right border, and the content extends into the it, but not beyond it', function () {
                    // ... and nothing else.
                    var border = 1;
                    f.$container.rightBorder( border );
                    $content.width( containerWidth + border );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content is exactly as wide as the element would be without a border, but the element does have a left border', function () {
                    // ... and nothing else.
                    //
                    // The left border reduces the visible area inside the element and pushes the content to the right.
                    var border = 1;
                    f.$container.leftBorder( border );
                    $content.width( containerWidth + border );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                if ( $.scrollbarWidth() === 0 ) {

                    it( 'when the content is as high as the element without scroll bars, and extends a bit beyond it horizontally (in browsers with scroll bar width 0)', function () {
                        // Normally, the horizontal scroll bar would obscure part of the content area inside the element
                        // and force a vertical scroll bar as well, but with width 0 it doesn't.
                        $content.contentBox( containerWidth + 1, containerHeight );
                        expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                    } );

                }

                it( 'when the content is wider and higher than the element, and the element is set to overflow-x: auto, overflow-y: hidden', function () {
                    // NB When overflow-x or overflow-y has been set to a value !== "visible" in one dimension, the
                    // other dimension defaults to "auto" and can't be set to "visible" any more.
                    f.$container
                        .overflow( "" )
                        .overflowX( "auto" )
                        .overflowY( "hidden" );

                    $content.contentBox( containerWidth +1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );


            } );

            describe( 'It detects a vertical and horizontal scroll bar', function () {

                it( 'when the content is wider and higher than the element', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                if ( $.scrollbarWidth() > 0 ) {

                    it( 'when the content is as wide as the element without scroll bars, and extends a bit beyond it vertically', function () {
                        // The vertical scroll bar obscures part of the content area inside the element and forces a
                        // horizontal scroll bar.
                        $content.contentBox( containerWidth, containerHeight + 1 );
                        expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                    } );

                    it( 'when the content is as high as the element without scroll bars, and extends a bit beyond it horizontally', function () {
                        // The horizontal scroll bar obscures part of the content area inside the element and forces a
                        // vertical scroll bar.
                        $content.contentBox( containerWidth + 1, containerHeight );
                        expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                    } );

                }

            } );

            describe( 'It does not detect a scroll bar', function () {

                it( 'when the content fits inside the element', function () {
                    $content.contentBox( containerWidth, containerHeight );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content is exactly as wide as the visible area inside the element, and the element has right padding which the content extends into', function () {
                    // ... and no other padding, borders, margins are involved.
                    //
                    // The right padding is squashed, not pushed out. A scroll bar does _not_ appear in this case. See http://jsbin.com/lokavo/9/ for an example.
                    var padding = 1;
                    f.$container.rightPadding( padding );
                    $content.width( containerWidth + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content is exactly as wide as the visible area inside the element, and the element has right padding which the content extends into (box-sizing: border-box)', function () {
                    // ... and no other padding, borders, margins are involved.
                    //
                    // The right padding is squashed, not pushed out. A scroll bar does _not_ appear in this case. See http://jsbin.com/lokavo/9/ for an example.
                    var padding = 1;
                    f.applyBorderBox();
                    f.$container
                        .rightPadding( padding )
                        .width( containerWidth );

                    $content.width( containerWidth + padding );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content takes up the full content area of the element, and the element has margins', function () {
                    // ... and nothing else.
                    $content.contentBox( containerWidth, containerHeight );
                    f.$container.margin( 10 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content takes up the full content area of the element, and the element has a border, which the content lines up with', function () {
                    // ... and nothing else.
                    $content.contentBox( containerWidth, containerHeight );
                    f.$container.border( 10 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the child nodes of the element are absolutely positioned outside of the element, but the element itself is not positioned', function () {
                    // The unpositioned element is not an offset parent for the child nodes, and they don't cause scroll bars to appear on the element.
                    $content.positionAt( containerHeight + 1, containerWidth + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content is wider and higher than the element, but the element is set to display:none', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    f.$container.hide();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content is wider and higher than the element, but the element is not attached to the DOM', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    f.$container.detach();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

            } );

        } );

        describe( 'Element with overflow:scroll', function () {

            var containerWidth, containerHeight, $content;

            beforeEach( function () {
                f = Setup.create( "overflowScroll", f );

                return f.ready.done( function () {
                    containerWidth = f.$container.width();
                    containerHeight = f.$container.height();
                    $content = f.$el;
                } );
            } );

            describe( 'It a detects a vertical scroll bar, and not a horizontal one', function () {

                it( 'when the content fits inside the element, and the element is set to overflow-x: hidden, overflow-y: scroll', function () {
                    // NB When overflow-x or overflow-y has been set to a value !== "visible" in one dimension, the
                    // other dimension defaults to "auto" and can't be set to "visible" any more.
                    f.$container
                        .overflow( "" )
                        .overflowX( "hidden" )
                        .overflowY( "scroll" );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

                it( 'when the content fits inside the element, and the element is set to overflow-x: auto, overflow-y: scroll', function () {
                    // NB When overflow-x or overflow-y has been set to a value !== "visible" in one dimension, the
                    // other dimension defaults to "auto" and can't be set to "visible" any more.
                    f.$container
                        .overflow( "" )
                        .overflowX( "auto" )
                        .overflowY( "scroll" );

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: true } );
                } );

            } );

            describe( 'It a detects a horizontal scroll bar, and not a vertical one', function () {

                it( 'when the content fits inside the element, and the element is set to overflow-x: scroll, overflow-y: hidden', function () {
                    f.$container
                        .overflow( "" )
                        .overflowX( "scroll" )
                        .overflowY( "hidden");

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

                it( 'when the content fits inside the element, and the element is set to overflow-x: scroll, overflow-y: auto', function () {
                    f.$container
                        .overflow( "" )
                        .overflowX( "scroll" )
                        .overflowY( "auto");

                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: false } );
                } );

            } );

            describe( 'It detects a vertical and horizontal scroll bar', function () {

                it( 'when the content of the element extends beyond it in both dimensions', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                it( 'when the content of the element extends beyond it vertically only', function () {
                    $content.contentBox( 1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                it( 'when the content of the element extends beyond it horizontally only', function () {
                    $content.contentBox( containerWidth + 1, 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                it( 'when the element does not have any content', function () {
                    f.$container.empty();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

            } );

            describe( 'It does not detect a scroll bar', function () {

                it( 'when the content is wider and higher than the element, but the element is set to display:none', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    f.$container.hide();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the content is wider and higher than the element, but the element is not attached to the DOM', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    f.$container.detach();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

            } );

        } );

        describe( 'Element with overflow: hidden', function () {

            describe( 'It does not detect a scroll bar', function () {

                var containerWidth, containerHeight, $content;

                beforeEach( function () {
                    f = Setup.create( "overflowHidden", f );

                    return f.ready.done( function () {
                        containerWidth = f.$container.width();
                        containerHeight = f.$container.height();
                        $content = f.$el;
                    } );
                } );

                it( 'when the content of the element extends beyond it in both dimensions', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the element does not have any content', function () {
                    f.$container.empty();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

            } );

        } );

        describe( 'Element with overflow: visible', function () {

            describe( 'It does not detect a scroll bar', function () {

                var containerWidth, containerHeight, $content;

                beforeEach( function () {
                    f = Setup.create( "overflowVisible", f );

                    return f.ready.done( function () {
                        containerWidth = f.$container.width();
                        containerHeight = f.$container.height();
                        $content = f.$el;
                    } );
                } );

                it( 'when the content of the element extends beyond it in both dimensions', function () {
                    $content.contentBox( containerWidth + 1, containerHeight + 1 );
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

                it( 'when the element does not have any content', function () {
                    f.$container.empty();
                    expect( f.$container.hasScrollbar() ).to.eql( { horizontal: false, vertical: false } );
                } );

            } );

        } );

        describe( 'Child window', function () {

            // Increase timeout to allow ample time for child window creation. Make it long enough to dismiss modal
            // warning dialogs in iOS, too, which must be done manually.
            this.timeout( 12000 );

            beforeEach( function () {
                f = Setup.create( "childWindow", f );
                return f.ready;
            } );

            it( 'When the child window has scroll bars and the global window does not, it detects the scroll bars of the child window', function () {
                var $childWindow = $( f.childWindow );
                f.$el.contentBox( $childWindow.width() + 1, $childWindow.height() + 1 );
                expect( $childWindow.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
            } );

        } );

        describe( 'Iframe', function () {
            var $iframeElement, $iframeWindow;

            beforeEach( function () {
                f = Setup.create( "iframe", f );

                return f.ready.done( function () {
                    $iframeElement = f.$container;
                    $iframeWindow = $( f.window );
                    f.$el.contentBox( $iframeWindow.width() + 1, $iframeWindow.height() + 1 );
                } );
            } );

            describe( 'The iframe window has scroll bars and the global window does not. It detects the scroll bars of the iframe window', function () {

                it( 'when called on the iframe window', function () {
                    expect( $iframeWindow.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );

                it( 'when called on the iframe element', function () {
                    expect( $iframeElement.hasScrollbar() ).to.eql( { horizontal: true, vertical: true } );
                } );
            } );

        } );

    } );

})();