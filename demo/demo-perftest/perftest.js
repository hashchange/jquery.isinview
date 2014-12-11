( function ( $, performance ) {
    "use strict";

    function createElements ( count, $container ) {
        var i,
            $elems = $();

        for ( i = 0; i < count; i++ ) $elems = $elems.add( '<div class="testContent">' + ( i + 1 ) + '</div>' );
        $container.append( $elems );
    }

    function getChecked ( $fieldset ) {
        var values = [];

        $fieldset.find( "input:checked" ).each( function () {
            values.push( this.value );
        } );

        return values;
    }

    function setup( spec ) {
        var iframeDocument,
            docReady = $.Deferred();

        spec.ready = $.Deferred();

        $reportCells.empty();
        $testStage.empty();

        if ( spec.container === "window" ) {

            spec.$stage = $testStage;
            docReady.resolve();

        } else {

            spec.$container = $( '<' + spec.container + ' class="container" />' ).appendTo( $testStage );
            spec.containerSelector = spec.container + ".container";

            if ( spec.container === "iframe" ) {

                // Create a standards-compliant document in the iframe. Include the test content style in the document.
                iframeDocument = spec.$container[0].contentDocument;
                iframeDocument.write( '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.testContent { margin: 0; padding: 0; border: 1px dotted grey; width: 10%; height: 20px; line-height: 20px; font-size: 10px; text-align: center; float: left; }</style><title></title></head><body></body></html>' );

                $( iframeDocument ).ready( function () {
                    spec.$stage = $( iframeDocument ).find( "body" );
                    docReady.resolve();
                } );

            } else {

                // Div container
                spec.$stage = spec.$container;
                docReady.resolve();

            }
        }

        docReady.done( function () {
            createElements( spec.elemCount, spec.$stage );
            spec.$elems = spec.$stage.children();

            spec.ready.resolve();
        } );


        // Hide the test manager interface to make room for test elements (otherwise, none of them might classify as
        // "in view")
        $testManager.hide();
    }

    function teardown () {
        $testStage.empty();
        $testManager.show();
    }

    function readSpec () {
        var spec = {};

        spec.components = getChecked( $( "#componentsUnderTest" ) );
        spec.elemCount = Number( $( "#elemCount" ).val() );
        spec.repeats = Number( $( "#repeats" ).val() );
        spec.container = getChecked( $( "#containerTypes" ) )[0];

        return spec;
    }

    function writeResults ( results ) {
        var componentName, result;

        // Log the full results object for inspection in the console, if need be
        if ( typeof console === "object" ) console.log( results );

        for ( componentName in results ) {
            //noinspection JSUnfilteredForInLoop
            result = results[componentName];

            $reportCells.filter( ".execTime." + componentName ).html( result.avgExecTime );
            $reportCells.filter( ".elemCount." + componentName ).html( result.visibleElements );

        }

    }

    function highlightResults () {
        $reportCells.hide().fadeIn();
    }

    function run( spec ) {

        var i, j, component, execTime,
            componentCount = spec.components.length,
            results = {};

        for ( i = 0; i < spec.repeats; i++ ) {

            performance.clearMarks();
            performance.clearMeasures();

            for ( j = 0; j < componentCount; j++ ) {

                // Shuffle: Test components in a different order in each iteration (ie, on each repeat)
                component = spec.components[ ( i + j ) % componentCount ];

                if ( !results[component] ) results[component] = { totalExecTime: 0, runs: [] };
                performance.mark( component + " - Start" );

                // Run the test, store the result
                results[component].runs.push( tests[component]( spec ) );

                performance.measure( component, component + " - Start" );

                // Integrate current results into the aggregated values
                results[component].skipped = results[component].skipped || results[component].runs[i].skipped;

                if ( !results[component].skipped ) {

                    execTime = performance.getEntriesByName( component )[0].duration;
                    results[component].runs[i].execTime = execTime;
                    results[component].totalExecTime += execTime;
                    results[component].avgExecTime = Math.round( results[component].totalExecTime / ( i + 1 ) ) + "ms";

                    if ( ! results[component].totalElements ) {
                        results[component].totalElements = results[component].runs[i].totalElements;
                    } else if ( results[component].totalElements !== results[component].runs[i].totalElements ) {
                        results[component].totalElements = "ERR inconsistent";
                    }

                    if ( ! results[component].visibleElements ) {
                        results[component].visibleElements = results[component].runs[i].visibleElements;
                    } else if ( results[component].visibleElements !== results[component].runs[i].visibleElements ) {
                        results[component].visibleElements = "ERR inconsistent";
                    }

                } else {

                    results[component].totalExecTime = results[component].avgExecTime = results[component].totalElements = results[component].visibleElements = "n/a";

                }

            }

        }

        return results;

    }

    var $testManager = $( "#testManager" ),
        $testStage = $( "#testStage" ),
        $reportTable = $( "#results" ).find( "table" ),
        $reportCells = $reportTable.find( "td.execTime, td.elemCount" ),
        $submit = $( "#runPerftest" ),
        tests = {};

    $submit.click( function ( event ) {
        var results,
            spec = readSpec();

        event.preventDefault();

        setup( spec );

        spec.ready.done( function () {

            results = run( spec );
            writeResults( results );
            teardown();
            highlightResults();

        } );
    } );

    // Test methods, for each component
    //
    // NB Method names on the test object must be the same as values of the component checkboxes in perftest.html

    tests.jqIsInView = function ( spec ) {
        var visibleElements,
            totalElements = spec.$elems.length;

        if ( spec.$container ) {
            visibleElements = spec.$elems.inView( spec.$container ).length;
        } else {
            visibleElements = spec.$elems.inViewport().length;
        }

        return {
            totalElements: totalElements,
            visibleElements: visibleElements,
            skipped: false
        };
    };

    tests.jqIsInViewSelector = function ( spec ) {
        var visibleElements,
            totalElements = spec.$elems.length,
            skipped = false;;

        if ( spec.container !== "div" ) {
            visibleElements = spec.$elems.filter( ':inViewport' ).length;
        } else {
            // The :inViewport selector always uses a window context (also works in an iframe); it can't handle other
            // containers
            totalElements = visibleElements = "n/a";
            skipped = true;
        }

        return {
            totalElements: totalElements,
            visibleElements: visibleElements,
            skipped: skipped
        };
    };

    tests.isInViewport = function ( spec ) {
        var visibleElements,
            totalElements = spec.$elems.length;

        if ( spec.$container ) {
            visibleElements = spec.$elems.filter( ':in-viewport( 0, ' + spec.containerSelector + ')' ).length;
        } else {
            visibleElements = spec.$elems.filter( ':in-viewport' ).length;
        }

        return {
            totalElements: totalElements,
            visibleElements: visibleElements,
            skipped: false
        };
    };

    tests.jqVisible = function ( spec ) {
        var totalElements = spec.$elems.length,
            visibleElements = 0,
            skipped = false;

        if (  spec.$container ) {

            // jquery.visible can't handle containers other than the viewport
            totalElements = visibleElements = "n/a";
            skipped = true;

        } else {

            spec.$elems.each( function () {
                if ( $( this ).visible() ) visibleElements++;
            } );

        }

        return {
            totalElements: totalElements,
            visibleElements: visibleElements,
            skipped: skipped
        };
    };

}( jQuery, performance ));