var Anumargak = require("./../src/letsRoute");
const MockRes = require('mock-res');

describe("Anumargak ", function() {
    it("should list registered routes correctly", function() {
        var router = Anumargak();

        function staticHandler() {}
        function dynamicHandler() {}

        const seq = [];
        router.on("GET", "/this/is/static", staticHandler);
        router.on("POST", "/this/is/:dynamic", dynamicHandler);

        const routes = router.registeredRoutes()

        expect(routes).toEqual([{
            method: 'GET',
            url: '/this/is/static',
            fn: staticHandler,
            verMap: undefined,
            params: undefined,
            store: undefined
        }, { method: 'POST',
            url: '/this/is/([^\\/]+)',
            fn: dynamicHandler,
            regex: /^\/this\/is\/([^\/]+)$/,
            verMap: undefined,
            params: {},
            paramNames: [ 'dynamic' ],
            store: undefined
        }])

    });
});
