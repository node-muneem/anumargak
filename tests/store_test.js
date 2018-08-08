var Anumargak = require("./../src/letsRoute");

describe("Anumargak store", function() {
    
    it("FIND: should capture rest url when /*/", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/static", () => 30, "something");
        anumargak.on("HEAD", "/this/is/static", () => 30, "nothing");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET", "/this/is/static").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/static").store ).toEqual("something");
        
        expect(anumargak.find("HEAD", "/this/is/static").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/static").store ).toEqual("nothing");
    });
});
