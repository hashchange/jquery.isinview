/*global describe, it, $ */
(function () {
    "use strict";

    describe( '$.scrollbarWidth', function () {

        var $hasScrollbars;

        afterEach( function () {
            if ( $hasScrollbars ) $hasScrollbars.remove();
        } );

        it( 'is a number', function () {
            expect( $.scrollbarWidth() ).to.be.a.number;
        } );

        it( 'is >=0', function () {
            expect( $.scrollbarWidth() ).to.be.at.least( 0 );
        } );

        it( 'is < 30 (assuming that a scrollbar can never be that big)', function () {
            expect( $.scrollbarWidth() ).to.be.below( 30 );
        } );

        it( 'matches the scrollbar width measured on a visible, scrolling element', function () {
            var $inner = $( "<div/>" ).css( { width: "100px", height: "100px" } );
            $hasScrollbars = $ ( '<div/>' )
                .css( { width: "50px", height: "50px", overflow: "scroll", margin: 0, padding: 0, borderStyle: "none" } )
                .append( $inner )
                .appendTo( "body" );

            expect( $.scrollbarWidth() ).to.equal( 50 - $hasScrollbars[0].clientWidth );
        } );

        describe( 'The method does not rely on the exposed plugin API. When all other public methods of the plugin are deleted from jQuery', function () {

            var globalScrollBarWidth, deletedApi;

            beforeEach( function () {
                globalScrollBarWidth = $.scrollbarWidth();
                deletedApi = deletePluginApiExcept( "scrollbarWidth", true );
            } );

            afterEach( function () {
                restorePluginApi( deletedApi );
            } );

            it( 'it works correctly and returns the global scroll bar width', function () {
                expect( $.scrollbarWidth() ).to.equal( globalScrollBarWidth );
            } );

        } );
    } );

})();