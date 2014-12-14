function inPhantomJs () {
    "use strict";
    return /PhantomJS/.test( navigator.userAgent );
}

function describe_noPhantom () {

    if ( inPhantomJs() ) {
        warn( "Skipping tests in PhantomJS. Use another browser to run the full suite." );
        describe.skip.apply( undefined, arguments );
    } else {
        describe.apply( undefined, arguments );
    }

}

function it_noPhantom () {

    if ( inPhantomJs() ) {
        warn( "Skipping test in PhantomJS. Use another browser to run the full suite." );
        it.skip.apply( undefined, arguments );
    } else {
        it.apply( undefined, arguments );
    }

}
