# jQuery.isInView

This jQuery plugin tells you if elements are in view inside a scrollable container, or inside a container hiding its overflow. It works with regard to the viewport, iframes, or nested scrolling elements. 

**Core methods**

You can choose between [filter methods][filters], an [`:inViewport` selector][api-selector], and [boolean queries][boolean-queries] like [`$elem.isInView()`][api-fn.isInView]. They are optimized for performance and ridiculously fast: filtering 1000 elements takes no more than 3ms on an elderly desktop running Chrome, and about 9ms on an underpowered mobile device. As a result, the plugin is suitable for event handlers which are called frequently - scroll and resize handlers, for instance - and deal with large numbers of elements.

**Useful helpers**

jQuery.isInView exposes a number of useful helper functions which are valuable in their own right. You get [`$elem.hasScrollbar()`][api-fn.hasScrollbar], [`$elem.scrollbarWidth()`][api-fn.scrollbarWidth] - telling you about the space taken up by scroll bars in a given element - and the global [`$.scrollbarWidth()`][api-scrollbarWidth], which returns a browser-specific constant. Finally, there is [`$elem.ownerWindow()`][api-fn.ownerWindow] which is helpful for operations in IFrames and child windows.

(If you think the API is a bit too prolific for your taste, feel free to overwrite any part of it with your own jQuery extensions. Each plugin method is independent of the others, at least with regard to the public API.)

**Tests**

Browsers are a moving target for development, and full of quirks, too. In this environment, the plugin needs to prove that it works. It comes along with a massive [test suite][tests], auto-generated from diverse scenarios and a carefully crafted set of base tests. [Performance tests][perftests] are also part of the package.

## Dependencies and setup

[jQuery][] is the only dependency. Include jquery.isinview.js after [jQuery][].

The stable version of jQuery.isInView is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install jquery.isinview`. With npm, it is `npm install jquery.isinview`.

## Usage by example: Lazy loading

Suppose you want to lazy-load images as soon as they are scrolled into view. You already have `<img>` tags for those images, but their `src` attribute hasn't been set, keeping the assets from loading. The URL for each image is stored in a `data-url` attribute of the `<img>` tag.

Now we implement a scroll handler, which loads each image as soon as it appears on screen. (Of course, we [must throttle][throttled-scroll] the calls. To keep things simple, we just use [_.throttle][Underscore.throttle] from the [Underscore][] library, which does the job just fine.)

### A rough draft

Our first iteration results in the following code:

```javascript
var $scrollable = $( window ),
    $images = $( ".imageContainer img" )
        .width( 200 ).height( 100 ),            // see (*)
    loader = function () {
        var loaded = [];
        $images
            .inViewport()                       // jQuery.isInView filter
            .each( function () { 
                this.src = $( this ).data( "url" );
                loaded.push( this );
            } );
        $images = $images.not( loaded );
    };

$scrollable.scroll( _.throttle( loader, 100 ) );
loader();                                       // see (**)
```

So far, we use `$images.inViewport()` to filter the images and grab those which are already on screen. Only then do we load the actual image assets. That is too late.

### Timely loading

Let's modify the [`.inViewport()` filter][api-fn.inViewport] to include images which are within 400px of the viewport. We can use the [`tolerance` option][api-options.tolerance] for that: `$images.inViewport( { tolerance: 400 } )`. Done!

So what exactly does "in view" mean? An element is considered to be "in view" when it is completely visible: its content box, padding, and border, every tiny bit of it. But we can change that. Perhaps we decide that images should load as soon as they begin to move into the tolerance zone, even if only partially. For that, there is the [`partially` option][api-options.partially]: `$images.inViewport( { partially: true, tolerance: 400 } )`.

Conversely, we could be more focused and declare that we only care about the content area, and not about the padding or border of an element. Another option, [`box: "content-box"`][api-options.box], would flip that particular switch. For lazy loading, however, being that specific does not make sense, so we leave the option at its default value, `"border-box"`.

### Flexible container

Imagine that we don't want to scroll the viewport, but rather the `.imageContainer` itself. So we redefine `$scrollable = $( ".imageContainer" )` in the snippet above. We also set it to `overflow: auto` in the CSS. 

But what else do we need to change? We can no longer use `.inViewport()`, so we turn to the more flexible [`.inView()` method][api-fn.inView] instead. It accepts two arguments: the container (`$scrollable` in our case), and the options we have arrived at above. Here is our final filter, then: `$images.inView( $scrollable, { partially: true, tolerance: 400 } )`. It also works for our original case, where `$scrollable` is a window.

That's it. This short example should leave you with a pretty good understanding of what jQuery.isInView can do. And it is safe to use, too. The final version is not some contrived code you'd never use in real life, but rather an efficient, production-ready way to do lazy loading.

Coming up next: a more formal description, more methods, and the fine print. The API section.

<small>_(*) We must assign a width and height to the image tags. Without explicit dimensions, they would not occupy any space in the document and fit into the viewport all at once. Hence, they would all be loaded immediately, defeating the purpose._</small>

<small>_(**) We want the first batch of images to appear without scrolling, so we need to call the loader directly once._</small>

## API

### Core

The primary purpose of jQuery.isInView is to tell you whether or not an element is "in view" - inside the viewport, or otherwise.

#### Filters

These methods operate on a jQuery collection and reduce it to those elements which are in view.

##### .inView( [container] [, options] )

_Returns: jQuery_

Acts as a filter and returns those elements in the collection which are in view inside the window, or inside another container.

The container can be a window, iframe, scrollable element (`overflow: scroll` or `overflow: auto`), an element with `overflow: hidden`, or a selector for any of these. Defaults to the window containing the elements.

The size of the element is defined by its border-box, which includes its padding and border. Alternatively, the content-box of the element [can be used][api-options.box], excluding padding and borders.

Accepts the [options for core queries][api-options].

##### .inViewport( [options] )

_Returns: jQuery_

Acts as a filter and returns those elements in the collection which are in view inside the window. Shorthand for `$elem.inView( $elem.ownerWindow(), opts )`.

Accepts the [options for core queries][api-options].

##### :inViewport selector

Selects all elements which are in view inside the window. Equivalent to calling `.inViewport()` on a jQuery collection.

Does not accept options.

#### Boolean queries

These methods operate on a single element and return if a given element is in view.

##### .isInView( [container] [, options] )

_Returns: boolean_

Returns true if the element is in view inside the window, or inside another container. Examines the first element in a jQuery collection.

The container can be a window, iframe, scrollable element (`overflow: scroll` or `overflow: auto`), an element with `overflow: hidden`, or a selector for any of these. Defaults to the window containing the elements.

The size of the element is defined by its border-box, which includes its padding and border. Alternatively, the content-box of the element [can be used][api-options.box], excluding padding and borders.

Accepts the [options for core queries][api-options].

##### .isInViewport( [options] )

_Returns: boolean_

Returns true if the element is in view inside the window. Examines the first element in a jQuery collection. Shorthand for `$elem.isInView( $elem.ownerWindow(), opts )`.

Accepts the [options for core queries][api-options].

#### Options

TODO list options

### Helpers

By necessity, jQuery.isInView has to deal with scroll bars a lot. It also operates in windows other than the global one. A few utilities have come out of this.

#### Scroll bar

##### .hasScrollbar( [axis] )

_Returns: number or object (or undefined)_

Checks if an element has a scroll bar. The axis can be specified as `"horizontal"`, `"vertical"`, or `"both"`. Both axes are checked by default.

The return type depends on whether one or both axes are queried. For a single axis, the method returns a boolean. For both axes, it returns an object with the state of each individual axis, e.g. `{ vertical: true, horizontal: false }`.

Only acts on the first element of a jQuery collection. Returns undefined if the collection is empty.

The `.hasScrollbar` method can be called on any item in a jQuery collection. It attempts to convert items intelligently into a sensible target for a scroll bar query if possible. Specifically, `.hasScrollbar()`  

- looks for window scroll bars if called on a window, document, or document element (html tag)
- looks for scroll bars on the content window of an iframe if called on the iframe element
- looks for scroll bars on the body tag itself (!) if called on the body. Usually, there aren't any - if you want to find out about window scroll bars, don't call the method on the body.

Please be aware that the method checks for the presence of a scroll bar and nothing else. It doesn't mean that the scroll bar actually scrolls, or takes up any space:

- It always returns true for `overflow: scroll`, even if the element doesn't contain content which needs to be scrolled.
- It returns true if there is a scroll bar of width 0, which is the standard behaviour of Safari on the Mac and on iOS.

##### .scrollbarWidth( [axis] )

_Returns: number or object (or undefined)_

Returns the effective size (width) of a scrollbar on the element, in pixels, as a number without unit. The axis can be specified as `"horizontal"`, `"vertical"`, or `"both"`. Both axes are queried by default.

The return type depends on whether one or both axes are queried. For a single axis, the method returns a number. For both axes, it returns an object with the size of each individual scroll bar, e.g. `{ vertical: 28, horizontal: 0 }`.

For a given axis, the method returns the value of [`$.scrollbarWidth()`][api-scrollbarWidth], a browser constant, if there is a scroll bar, and 0 if there isn't. It does not handle custom scroll bars. The default scroll bars of the browser are expected to appear.

Only acts on the first element of a jQuery collection. Returns undefined if the collection is empty.

Please be aware that the method does not allow you to infer the presence of a scroll bar, or whether it actually scrolls:

- It always returns the default scroll bar width for `overflow: scroll`, even if the element doesn't contain content which needs to be scrolled.
- It returns 0 if there is no scroll bar, but also if there _is_ a scroll bar of width 0, which is the standard behaviour of Safari on the Mac and on iOS.

For the type of elements the method can be called on, and how they are handled, see [`$.fn.hasScrollbar`, above][api-fn.hasScrollbar].

##### jQuery.scrollbarWidth()

_Returns: number_

Returns the size (width) of the scrollbar for a given browser, in pixels, as a number without unit.

Unlike the preceding [`.scrollbarWidth` method][api-fn.scrollbarWidth], this one here is _not_ called on a jQuery collection. It returns a browser constant. Invoke it as `$.scrollbarWidth()`.

If the browser doesn't provide permanent scrollbars, and instead shows them as a temporary overlay while actually scrolling the page, scrollbar size is reported as 0. That is the default behaviour in mobile browsers, and in current versions of OS X.

#### Other

##### .ownerWindow()

_Returns: Window (or undefined)_

Returns the window containing the element. Examines the first element in a jQuery collection. 

If the "element" is a window, `ownerWindow` returns the window itself. If there aren't any elements in the jQuery collection, `ownerWindow` returns undefined.

If the element is inside an iframe, `ownerWindow` returns the window representing the iframe. (Please keep in mind that selecting elements inside an iframe, from code running in the context of the global window, is subject to cross-domain security restrictions and does not always work.)

However, if the element _is_ the iframe, `ownerWindow` returns the window containing the iframe.

## Browser support

jQuery.isInView has been tested with 

- 2015 versions of Chrome, Firefox, Safari, and Opera on the Desktop
- IE9+
- Safari on iOS 8, Chrome on Android 5

The plugin is not formally tested in IE8 (due to a limitation of the test suite), but casual testing has shown that it works there, too. Your mileage may vary, though, if you make heavy use of options - some bugs might have gone unnoticed.

Feel free to [run the test suite][tests] on other devices. Feedback is welcome, of successful tests as well as failing ones.

## Limitations

TODO

For now, the plugin doesn't deal with multiple, nested scrolls, but it merely isn't aggregating the results for you yet. You can call it on each individual container and simply chain the results (with `&&` for boolean tests, or filter chaining).

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone, edit `bower.json` first.

### Running tests, creating a new build

#### Considerations for testing

Some tests are executed in a child window (aka pop-up window). Please _disable the pop-up blocker of the browser_ for the domain the tests are run under (usually localhost), or they will fail.

To run the tests on on remote clients (mobile devices), start a web server with `grunt interactive` and visit `http://[your-host-ip]:9400/web-mocha/` with the client browser. Running the tests in the browser like this takes a _long_ time, so it makes sense to disable the power-save/sleep/auto-lock timeout on the mobile device. 

Further, on iOS, you need to guide the tests along. Even with the pop-up blocker disabled, iOS displays notifications each time a child window is opened by a test, and you need to dismiss each notification manually. You have about a minute to hit OK before the related part of the test suite times out. These notifications show up multiple times, so keep an eye on your device until all tests are done.

#### Performance tests

You can examine the performance of jQuery.isInView, and compare it to some other popular plugins which served as a benchmark during development. Spin up a server with `grunt demo` and navigate to the performance test page, `http://[your-host-ip]:9400/demo/perftest/`. 

#### Tool chain and commands

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## License

MIT.

Copyright (c) 2014, 2015 Michael Heim.

[filters]: #filters "API: filters"
[api-fn.inView]: #inview-container-options- "API: .inView()"
[api-fn.inViewport]: #inviewport-options- "API: .inViewport()"
[api-selector]: #-inviewport-selector "API: :inViewport selector"
[boolean-queries]: #boolean-queries "API: boolean queries"
[api-fn.isInView]: #isinview-container-options- "API: .isInView()"
[api-options]: #options "API: Options for core queries"
[api-options.tolerance]: # "API: "
[api-options.partially]: # "API: "
[api-options.box]: # "API: "
[api-fn.hasScrollbar]: #hasscrollbar-axis- "API: .hasScrollbar()"
[api-fn.scrollbarWidth]: #scrollbarwidth-axis- "API: .scrollbarWidth()"
[api-scrollbarWidth]: #jqueryscrollbarwidth- "API: jQuery.scrollbarWidth()"
[api-fn.ownerWindow]: #ownerwindow- "API: .ownerWindow()"

[tests]: #running-tests-creating-a-new-build "Running tests, creating a new build"
[perftests]: #performance-tests "Performance tests"

[dist-dev]: https://raw.github.com/hashchange/jquery.isinview/master/dist/jquery.isinview.js "jquery.isinview.js"
[dist-prod]: https://raw.github.com/hashchange/jquery.isinview/master/dist/jquery.isinview.min.js "jquery.isinview.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/jquery.isinview/master/dist/amd/jquery.isinview.js "jquery.isinview.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/jquery.isinview/master/dist/amd/jquery.isinview.min.js "jquery.isinview.min.js, AMD build"

[jQuery]: http://jquery.com/ "jQuery"
[Underscore]: http://underscorejs.org/ "Underscore.js"

[throttled-scroll]: http://ejohn.org/blog/learning-from-twitter/ "John Resig: Learning from Twitter"
[Underscore.throttle]: http://underscorejs.org/#throttle "Underscore.js: _.throttle()"

[opera-failing-test-comment]: 

[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha - the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS - Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"