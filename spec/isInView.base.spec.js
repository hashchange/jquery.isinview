/*global describe, it, $ */
(function () {
    "use strict";

    describe( 'isInView: basics', function () {

        var testId,
            $testStage, testStageId, testStageSelector,
            $container, containerId, containerSelector,
            $el,
            $containerIframe, iframeId, iframeSelector,
            $elInIframe;

        beforeEach( function () {
            testId = getTimestamp();

            testStageId = "testStage_" + testId;
            testStageSelector = "#" + testStageId;

            containerId = "test_container_" + testId;
            containerSelector = "#" + containerId;

            iframeId = "test_iframe_" + testId;
            iframeSelector = "#" + iframeId;

            $el = $( '<div/>' ).width( 50 ).height( 50 );
            $elInIframe = $( '<div/>' ).width( 50 ).height( 50 );
            $container = $( '<div id="' + containerId + '"/>' ).append( $el );
            $containerIframe = $( '<iframe id="' + iframeId + '"/>' ).append( $elInIframe );
            $testStage = $( '<div id="' + testStageId + '"/>' ).append( $container, $containerIframe ).prependTo( 'body' );
        } );

        afterEach( function () {
            if ( $testStage ) $testStage.remove();
        } );

        describe( 'For a container, it', function () {

            it( 'accepts a window', function () {
                expect( function () { $el.isInView( window ); } ).not.to.throw( Error );
            } );

            it( 'accepts a $( window )', function () {
                expect( function () { $el.isInView( $( window ) ); } ).not.to.throw( Error );
            } );

            it( 'accepts an element with overflow:scroll', function () {
                $container.css( { overflow: "scroll" } );
                expect( function () { $el.isInView( $container[0] ); } ).not.to.throw( Error );
            } );

            it( 'accepts an element with overflow:auto', function () {
                $container.css( { overflow: "auto" } );
                expect( function () { $el.isInView( $container[0] ); } ).not.to.throw( Error );
            } );

            it( 'accepts an element with overflow:hidden', function () {
                $container.css( { overflow: "hidden" } );
                expect( function () { $el.isInView( $container[0] ); } ).not.to.throw( Error );
            } );

            it( 'accepts an element with suitable overflow (scroll, hidden, auto) in a jQuery wrapper', function () {
                $container.css( { overflow: "auto" } );
                expect( function () { $el.isInView( $container ); } ).not.to.throw( Error );
            } );

            it( 'accepts an iframe element', function () {
                expect( function () { $el.isInView( $containerIframe[0] ); } ).not.to.throw( Error );
            } );

            it( 'accepts an iframe element in a jQuery wrapper', function () {
                expect( function () { $el.isInView( $containerIframe ); } ).not.to.throw( Error );
            } );

            it( 'accepts a document', function () {
                expect( function () { $el.isInView( document ); } ).not.to.throw( Error );
            } );

            it( 'accepts a document in a jQuery wrapper', function () {
                expect( function () { $el.isInView( $( document ) ); } ).not.to.throw( Error );
            } );

            it( 'accepts a selector string for an element with suitable overflow (scroll, hidden, auto)', function () {
                $container.css( { overflow: "auto" } );
                expect( function () { $el.isInView( containerSelector ); } ).not.to.throw( Error );
            } );

            it( 'accepts a selector string for an iframe element', function () {
                expect( function () { $el.isInView( iframeSelector ); } ).not.to.throw( Error );
            } );

            it( 'throws an error when passed an element with overflow:visible', function () {
                $container.css( { overflow: "visible" } );
                expect( function () { $el.isInView( $container[0] ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed an element with overflow:visible, in a jQuery wrapper', function () {
                $container.css( { overflow: "visible" } );
                expect( function () { $el.isInView( $container ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed the queried element itself', function () {
                // Set the element to overflow:auto to make sure the error is caused by the identity, not an
                // unsuitable overflow setting.
                $el.css( { overflow: "auto" } );
                expect( function () { $el.isInView( $el[0] ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed the queried element itself, in a jQuery wrapper', function () {
                // Set the element to overflow:auto to make sure the error is caused by the identity, not an
                // unsuitable overflow setting.
                $el.css( { overflow: "auto" } );
                expect( function () { $el.isInView( $el ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed an element which is the child of the queried element', function () {
                var $childContainer = $( "<div/>" ).css( { overflow: "auto" } ).appendTo( $el );
                expect( function () { $el.isInView( $childContainer[0] ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed an element which is the child of the queried element, in a jQuery wrapper', function () {
                var $childContainer = $( "<div/>" ).css( { overflow: "auto" } ).appendTo( $el );
                expect( function () { $el.isInView( $childContainer ); } ).to.throw( Error );
            } );

            // todo fix
            it( 'throws an error when passed an iframe element with inaccessible content due to same-origin restrictions', function () {
                $containerIframe[0].src = "https://www.google.com/";
                expect( function () { $el.isInView( $containerIframe ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed an empty jQuery wrapper', function () {
                expect( function () { $el.isInView( $() ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed a selector which matches an unsuitable element, eg with overflow:visible', function () {
                $container.css( { overflow: "visible" } );
                expect( function () { $el.isInView( containerSelector ); } ).to.throw( Error );
           } );

            it( 'throws an error when passed a selector which does not match an element', function () {
                expect( function () { $el.isInView( "#i_do_not_exist" ); } ).to.throw( Error );
            } );

        } );

    } );

})();