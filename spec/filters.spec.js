/*global describe, it, $ */
(function () {
    "use strict";

    describe( 'Element filters: .inView(), :inViewport', function () {

        var $testStage, $container, $el, $elOut;

        beforeEach( function () {
            $el = $( '<div/>' ).contentBox( 50, 50 ).contentOnly();
            $elOut = $( '<div/>' ).contentBox( 50, 50 ).contentOnly().positionAt( -100, -100 );
            $container = $( '<div/>' ).append( $el ).contentOnly();
            $testStage = $( '<div id="' + "testStage_" + getTimestamp() + '"/>' ).append( $container ).prependTo( 'body' ).contentOnly();

            $( "body, html" ).contentOnly();
        } );

        afterEach( function () {
            if ( $testStage ) $testStage.remove();
        } );

        describe( 'inView', function () {

            describe( 'When the element selection', function () {

                it( 'is empty, inView returns an empty jQuery set', function () {
                    expect( $().inView() ).to.eql( $() );
                } );

                it( 'consists of two elements, the first being in view, the second out of view, inView returns the first element', function () {
                    $elOut.insertAfter( $el );
                    expect( $container.children().inView() ).to.eql( $el );
                } );

                it( 'consists of two elements, the first being out of view, the second in view, inView returns the second element', function () {
                    $elOut.insertBefore( $el );
                    expect( $container.children().inView() ).to.eql( $el );
                } );

            } );

        } );

        describe( ':inViewport', function () {

            describe( 'When the element selection', function () {

                // NB Filters return a jQuery object which contains additional information (such as the set of elements
                // before filtering, in a prevObject property). Therefore, the results object can't be compared to "normal"
                // jQuery selections directly, as they won't be deeply equal. Instead, we compare the underlying array of
                // DOM nodes, with .get().

                it( 'is empty, :inViewport returns an empty jQuery set', function () {
                    expect( $().filter( ':inViewport' ).get() ).to.eql( $().get() );
                } );

                it( 'consists of two elements, the first being in view, the second out of view, :inViewport returns the first element', function () {
                    // We test the selector in two notations: on its own (':inViewport'), and appended to another selector
                    // ('div:inViewport').
                    $elOut.insertAfter( $el );
                    expect( $container.children().filter( ':inViewport' ).get() ).to.eql( $el.get() );
                    expect( $container.children().filter( 'div:inViewport' ).get() ).to.eql( $el.get() );
                } );

                it( 'consists of two elements, the first being out of view, the second in view, :inViewport returns the second element', function () {
                    // We test the selector in two notations: on its own (':inViewport'), and appended to another selector
                    // ('div:inViewport').
                    $elOut.insertBefore( $el );
                    expect( $container.children().filter( ':inViewport' ).get() ).to.eql( $el.get() );
                    expect( $container.children().filter( 'div:inViewport' ).get() ).to.eql( $el.get() );
                } );

            } );

        } );

    } );

})();