// !!!!!!!!!!!!!!!!!!!!!!!!!!
// Depends on basic-utils.js
// !!!!!!!!!!!!!!!!!!!!!!!!!!

$.fn.padding = function ( size ) {
    return this.css( { padding: toPx( size ) } );
};

$.fn.border = function ( size ) {
    if ( parseFloat( size ) === 0 ) {
        return this.css( { border: "none" } );
    } else {
        return this.css( { border: toPx( size ) + " solid grey" } );
    }
};

$.fn.margin = function ( size ) {
    return this.css( { margin: toPx( size ) } );
};

$.fn.contentBox = function ( width, height ) {
    return this.width( width ).height( height );
};

$.fn.paddingAndBorder = function ( paddingSize, borderSize ) {
    if ( isUndefined( paddingSize ) ) paddingSize = 9;
    if ( isUndefined( borderSize ) ) borderSize = 1;
    return this.padding( paddingSize ).border( borderSize );
};

$.fn.contentOnly = function () {
    return this.padding( 0 ).border( 0 ).margin( 0 );
};

$.fn.floatLeft = function () {
    return this.css( { float: "left" } );
};

$.fn.positionAt = function ( top, left ) {
    return this.css( {
        position: "absolute",
        top: toPx( top ),
        left: toPx( left )
    } );
};

$.fn.overflow = function ( value ) {
    return this.css( { overflow: value } );
};


function toPx ( value ) {
    return isNumber( value ) ? value + "px" : value;
}


