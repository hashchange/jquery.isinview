/*global describe, it, $ */
(function () {
    "use strict";

    describe( '$.fn.ownerWindow', function () {

        var $testElem;

        afterEach( function () {
            if ( $testElem ) $testElem.remove();
        } );

        describe( 'In the global window, ownerWindow', function () {

            it( 'returns the window when called on the window', function () {
                expect( $( window ).ownerWindow() ).to.equal( window );
            } );

            it( 'returns the window when called on the document', function () {
                expect( $( document ).ownerWindow() ).to.equal( window );
            } );

            it( 'returns the window when called on an attached HTML element', function () {
                $testElem = $( "<div/>" ).appendTo( "body" );
                expect( $testElem.ownerWindow() ).to.equal( window );
            } );

            it( 'returns the window when called on a set of HTML elements', function () {
                $testElem = $( "<div/><div/><div/>" ).appendTo( "body" );
                expect( $testElem.ownerWindow() ).to.equal( window );
            } );

            it( 'returns the window when called on a document fragment', function () {
                // ...presuming the document fragment is created in the context of that window.
                $testElem = $( document.createDocumentFragment() );
                expect( $testElem.ownerWindow() ).to.equal( window );
            } );

            it( 'returns the window when called on a detached HTML element', function () {
                // ...presuming the detached HTML element is created in the context of that window.
                $testElem = $( "<div/>" );
                expect( $testElem.ownerWindow() ).to.equal( window );
            } );

            it( 'returns undefined when called on an empty jQuery set', function () {
                expect( $().ownerWindow() ).to.be.undefined;
                expect( $( "#nonexistent" ).ownerWindow() ).to.be.undefined;
            } );

        } );

        describe( 'In an iframe, ownerWindow', function () {

            var $iframe, iframe;

            beforeEach( function () {
                $iframe = $( "<iframe/>" ).appendTo( "body" );
                iframe = $iframe[0];
                if ( !iframe.contentWindow || !iframe.contentDocument ) throw new Error( "Failed to set up iframe tests. Can't access the content of the iframe" );
            } );

            afterEach( function () {
                if ( $iframe ) $iframe.remove();
            } );


            it( 'returns the parent window of the iframe when called on the iframe element itself', function () {
                expect( $iframe.ownerWindow() ).to.equal( window );
            } );

            it( 'returns the iframe window when called on the window', function () {
                expect( $( iframe.contentWindow ).ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns the iframe window when called on the document', function () {
                expect( $( iframe.contentDocument ).ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns the iframe window when called on an attached HTML element', function () {
                var $body = $( "body", iframe.contentDocument );
                $testElem = $( "<div/>", iframe.contentDocument ).appendTo( $body );
                expect( $testElem.ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns the iframe window when called on a set of HTML elements', function () {
                var $body = $( "body", iframe.contentDocument );
                $testElem = $( "<div/><div/><div/>", iframe.contentDocument ).appendTo( $body );
                expect( $testElem.ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns the iframe window when called on a document fragment', function () {
                // ...presuming the document fragment is created in the context of that window.
                $testElem = $( iframe.contentDocument.createDocumentFragment() );
                expect( $testElem.ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns the iframe window when called on a detached HTML element', function () {
                // ...presuming the detached HTML element is created in the context of that window.
                $testElem = $( "<div/>", iframe.contentDocument );
                expect( $testElem.ownerWindow() ).to.equal( iframe.contentWindow );
            } );

            it( 'returns undefined when called on an empty jQuery set', function () {
                expect( $( "#nonexistent", iframe.contentDocument ).ownerWindow() ).to.be.undefined;
            } );

        } );

        describe( 'In a child window, ownerWindow', function () {

            var childWindow;

            before( function () {
                childWindow = createChildWindow();
                if ( !childWindow ) throw new Error( "Can't create child window for tests. Please check if a pop-up blocker is preventing it" );
            } );

            after( function () {
                if ( childWindow ) childWindow.close();
            } );

            it( 'returns the window when called on the window', function () {
                expect( $( childWindow ).ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns the window when called on the document', function () {
                expect( $( childWindow.document ).ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns the window when called on an attached HTML element', function () {
                var $body = $( "body", childWindow.document );
                $testElem = $( "<div/>", childWindow.document ).appendTo( $body );
                expect( $testElem.ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns the window when called on a set of HTML elements', function () {
                var $body = $( "body", childWindow.document );
                $testElem = $( "<div/><div/><div/>", childWindow.document ).appendTo( $body );
                expect( $testElem.ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns the window when called on a document fragment', function () {
                // ...presuming the document fragment is created in the context of that window.
                $testElem = $( childWindow.document.createDocumentFragment() );
                expect( $testElem.ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns the window when called on a detached HTML element', function () {
                // ...presuming the detached HTML element is created in the context of that window.
                $testElem = $( "<div/>", childWindow.document );
                expect( $testElem.ownerWindow() ).to.equal( childWindow );
            } );

            it( 'returns undefined when called on an empty jQuery set', function () {
                expect( $( "#nonexistent", childWindow.document ).ownerWindow() ).to.be.undefined;
            } );

        } );

    } );

})();