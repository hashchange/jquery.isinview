/*global describe, it, $ */
(function () {
    "use strict";

    describe( 'isInView: basics', function () {

        var testId,
            $testStage, testStageId, testStageSelector,
            $container, containerId, containerSelector,
            $el,
            $containerIframe, iframeId, iframeSelector, iframeDocument,
            $elInIframe,
            childWindow;

        before( function () {
            childWindow = createChildWindow();
            if ( !childWindow ) throw new Error( "Can't create child window for tests. Please check if a pop-up blocker is preventing it" );
        } );

        after( function () {
            if ( childWindow ) childWindow.close();
        } );

        beforeEach( function () {
            testId = getTimestamp();

            testStageId = "testStage_" + testId;
            testStageSelector = "#" + testStageId;

            containerId = "test_container_" + testId;
            containerSelector = "#" + containerId;

            iframeId = "test_iframe_" + testId;
            iframeSelector = "#" + iframeId;

            $el = $( '<div/>' ).width( 50 ).height( 50 );
            $container = $( '<div id="' + containerId + '"/>' ).append( $el );

            $containerIframe = $( '<iframe id="' + iframeId + '"/>' );
            $testStage = $( '<div id="' + testStageId + '"/>' ).append( $container, $containerIframe ).prependTo( 'body' );
            
            // NB The default document content (e.g., the body) in an iframe only gets created after the iframe is added
            // to the DOM.
            iframeDocument = $containerIframe[0].contentDocument;
            $elInIframe = $( '<div/>', iframeDocument ).width( 50 ).height( 50 );
            $( iframeDocument.body ).append( $elInIframe );
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

            it( 'accepts an iframe', function () {
                expect( function () { $elInIframe.isInView( $containerIframe[0] ); } ).not.to.throw( Error );
            } );

            it( 'accepts an iframe in a jQuery wrapper', function () {
                expect( function () { $elInIframe.isInView( $containerIframe ); } ).not.to.throw( Error );
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
                expect( function () { $elInIframe.isInView( iframeSelector ); } ).not.to.throw( Error );
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

            it( 'throws an error when passed a window does not contain the queried element', function () {
                expect( function () { $el.isInView( childWindow ); } ).to.throw( Error );
            } );

            it( 'throws an error when passed a window does not contain the queried element, in a jQuery wrapper', function () {
                expect( function () { $el.isInView( $( childWindow ) ); } ).to.throw( Error );
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

        describe( 'When unspecified, the container defaults to ', function () {

            it( 'the current (root) window if the element is in the root window', function () {
                // We test this by checking an element in a nested container. It is invisible in the inner container,
                // but on screen with regard to the viewport.
                $container.css( { overflow: "auto", position: "absolute", height: "50px", width: "50px", top: "-50px", left: 0 } );
                $el.css( { position: "absolute", top: "51px", left: 0 } );
                expect( $el.isInView() ).to.be.true;
            } );

            it( 'the current (child) window if the element is in a child window', function () {
                // We test this by checking an element in a nested container. It is invisible in the inner container,
                // but on screen with regard to the viewport.
                var $elInChildWindow = $( '<div/>', childWindow.document )
                        .css( { position: "absolute", height: "50px", width: "50px", top: "51px", left: 0 } ),

                    $containerInChildWindow = $( '<div/>', childWindow.document )
                        .prependTo( childWindow.document.body )
                        .append( $elInChildWindow )
                        .css( { overflow: "auto", position: "absolute", height: "50px", width: "50px", top: "-50px", left: 0 } );

                expect( $elInChildWindow.isInView() ).to.equal( $elInChildWindow.isInView( childWindow.document ) );
                expect( $elInChildWindow.isInView() ).to.be.true;
            } );

            it_noPhantom( 'the current (iframe) window if the element is in an iframe', function () {
                // ATTN This test fails in PhantomJS. This is a PhantomJS issue, not one of jQuery.isInView.

                // We test this by moving the iframe off screen, then checking an element in a nested container. It is
                // invisible in the inner container, and not in view with regard to the viewport, but inside the
                // confines of the iframe window.
                var $containerInIframe = $( '<div/>', iframeDocument )
                    .prependTo( iframeDocument.body )
                    .append( $elInIframe )
                    .css( { overflow: "auto", position: "absolute", height: "50px", width: "50px", top: "-50px", left: 0 } );

                $elInIframe.css( { position: "absolute", top: "51px", left: 0 } );
                $containerIframe.css( { position: "absolute", height: "200px", width: "200px", top: "-400px", left: 0 } );

                expect( $elInIframe.isInView() ).to.equal( $elInIframe.isInView( iframeDocument ) );
                expect( $elInIframe.isInView() ).to.be.true;
            } );

        } );

    } );

})();