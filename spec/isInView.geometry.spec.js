/*global describe, it, $ */
(function () {
    "use strict";

    describe( 'isInView: Geometry', function () {

        // todo possibly make this loop through various container types, using Leche (window, iframe, child window, div-overflow:hidden, div-overflow:auto, possibly NOT div-overflow:scroll (see todo in some tests) OR use IF conditionals
        // todo build individual case (window), then comment out the setup and make a new one for div etc, finally build the loop

        describe( 'An element with only a content area only (no padding, borders, margins)', function () {

            describe( 'When the element is inside the container, and is smaller than the container', function () {

                it( 'it is in view', function () {

                } );

                it( 'it is in partial view', function () {

                } );

            } );

            describe( 'When the element is exactly as large as the container', function () {
                // Ie, its edge lines up with the container on all four sides.

            } );

            describe( 'When the element is exactly as high as the container, but extends under the horizontal scrollbar', function () {
                // Element must be narrow enough not to be under the horizontal scrollbar as it appears, otherwise a
                // vertical scrollbar comes into play, too.

                // todo ATTN how would this work with overflow:scroll? It wouldn't, really. If looping, use overflow:auto exclusively OR exclude with an IF??????
            } );

            describe( 'When the element is exactly as wide as the container, but extends under the vertical scrollbar', function () {
                // Element must be short enough not to be under the vertical scrollbar as it appears, otherwise a
                // horizontal scrollbar comes into play, too.

                // todo ATTN how would this work with overflow:scroll? It wouldn't, really. If looping, use overflow:auto exclusively
            } );

            describe( 'When the element is exactly as large as the container, but extends under scrollbars', function () {

            } );

            describe( 'When the element is larger than the container, and encompasses it', function () {

            } );

            describe( 'When the element is partially above the container', function () {

            } );

            describe( 'When the element is partially above the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully above the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully above the container, but partially within tolerance', function () {

            } );

            describe( 'When the element is above the container, and its bottom edge is just inside the container', function () {

            } );

            describe( 'When the element is above the container, and its bottom edge touches the container', function () {

            } );

            describe( 'When the element is partially below the container', function () {

            } );

            describe( 'When the element is partially below the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully below the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully below the container, but partially within tolerance', function () {

            } );

            describe( 'When the element is below the container, and its top edge is just inside the container', function () {

            } );

            describe( 'When the element is below the container, and its top edge touches the container', function () {

            } );

            describe( 'When the element is partially left of the container', function () {

            } );

            describe( 'When the element is partially left of the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully left of the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully left of the container, but partially within tolerance', function () {

            } );

            describe( 'When the element is left of the container, and its right edge is just inside the container', function () {

            } );

            describe( 'When the element is left of the container, and its right edge touches the container', function () {

            } );

            describe( 'When the element is partially right of the container', function () {

            } );

            describe( 'When the element is partially right of the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully right of the container, but within tolerance', function () {

            } );

            describe( 'When the element is fully right of the container, but partially within tolerance', function () {

            } );

            describe( 'When the element is right of the container, and its left edge is just inside the container', function () {

            } );

            describe( 'When the element is right of the container, and its left edge touches the container', function () {

            } );

        } );

        describe( 'An element with padding and borders', function () {

            describe( 'When the element is exactly as large as the container, its borders lining up with the edge of the container', function () {

            } );

            describe( 'When the element, including borders, is exactly as large as the container, but extends under scrollbars', function () {
                // todo ATTN how would this work with overflow:scroll? It wouldn't, really. If looping, use overflow:auto exclusively
            } );

            describe( 'When the element is above the container, and its bottom border is just inside the container', function () {

            } );

            describe( 'When the element is above the container, and its bottom border touches the container', function () {

            } );

            describe( 'When the element is below the container, and its top border is just inside the container', function () {

            } );

            describe( 'When the element is below the container, and its top border touches the container', function () {

            } );

            describe( 'When the element is left of the container, and its right border is just inside the container', function () {

            } );

            describe( 'When the element is left of the container, and its right border touches the container', function () {

            } );

            describe( 'When the element is right of the container, and its left border is just inside the container', function () {

            } );

            describe( 'When the element is right of the container, and its left border touches the container', function () {

            } );

        } );

        describe( 'An element with margins', function () {

            describe( 'When the element is inside of the container, and its margins extend beyond the container', function () {
                // We achieve this by positioning an outer div partially outside of the container, and push an inner div
                // back into the container with its margins.


                // expected: in full view
            } );

            describe( 'When an element is outside of the container, and its margins extend into the container', function () {

                // expected: not in view
            } );

            describe( 'When an element would be inside of the container without margins, and its width is expanded beyond the container with negative margins', function () {
                // We achieve this by declaring width:auto for the element, which makes it expand to the width of its
                // container; and then declaring a negative margin on the left and right, which makes its width stretch
                // _beyond_ the container.
                //
                // See see http://jsbin.com/jucazo/3/edit for an example.

                // expected: in partial view
            } );


        } );

        // todo ATTN the following scenarios are NOT applicable to window, but to div:overflow and div:auto/scroll - exclude with an IF when looping

        // NB A container with content area only (no padding, borders, margins) has been the basis for the preceding
        // tests, and does to be considered when testing specific container geometries.

        // todo -------------------->>>>> continue here <<<<<<---------------------------------------------

        describe( 'A container with padding', function () {
            // not applicable to window
        } );

        describe( 'A container with borders', function () {
            // not applicable to window
        } );

        // todo the rest, from here, is done
        describe( 'A container with margins', function () {
            // not applicable to window

            describe( 'When an element is exactly as large as the content area of the container, and the container has margins', function () {
                // expected: in full view
            } );

            describe( 'When an element is larger than the content area of the container, and extends into its margin (but not beyond)', function () {
                // expected: in partial view
            } );

            describe( 'When an element is outside of the content area of the container, but fully inside of one margin of the container', function () {
                // expected: not in view
            } );

            describe( 'When an element would be too wide for a container without margins, and the container is expanded with negative margins to encompass the element', function () {
                // For this, we need an outer div into which the container is placed. By declaring width:auto for the
                // container, it expands to the size of the outer div. With negative left and right margins, it expands
                // even further.
                //
                // The element just gets fixed dimensions to make it larger than the outer div (ie, part of it would be
                // hidden by the container if the container didn't have the negative margins).
                //
                // Again, see http://jsbin.com/jucazo/3/edit for an example of expansion by negative margins.
            } );

        } );





    } );

})();