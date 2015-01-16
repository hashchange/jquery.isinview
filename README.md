# jQuery.isInView

This jQuery plugin tells you if elements are in view inside a scrollable container, or inside a container hiding its overflow. It works with regard to the viewport, iframes, or nested scrolling elements. 

You can choose between filter methods and an `inViewport` selector. It does its job ridiculously fast, and is suitable for event handlers which fire frequently and handle large numbers of elements. (And it comes with an extensive test suite).

**Please note:**

This plugin is new and still a work in progress. As you can see, the documentation is not ready yet. Just have a look at the source, though. The API is actually quite well documented in there.

For now, the plugin doesn't deal with multiple, nested scrolls. (It merely isn't aggregating the results for you yet. But you can call it on each individual container and simply chain the results with `&&`.)

## Dependencies and setup

## Components

## Usage and examples

### The basics

### Options

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

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha - the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS - Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"