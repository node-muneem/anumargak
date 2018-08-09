var Anumargak = require("./../src/letsRoute");

describe("Anumargak", function() {

    it("unsafe regex: throw error when unsafe regex is used", function() {
        var anumargak = Anumargak();

        expect(() => {
            anumargak.on("GET", "/this/is/:dynamic((a+){10}y)", () => 30);
        }).toThrowError("((a+){10}y) seems unsafe.");

        expect(anumargak.count).toEqual(0);
    });

    it("unsafe regex: should not throw error when unsafe regex is used allowUnsafeRegex : true", function() {
        var anumargak = Anumargak({
            allowUnsafeRegex : true
        });

        anumargak.on("GET", "/this/is/:dynamic((a+){10}y)", () => 30);

        expect(anumargak.count).toEqual(1);
    });

});
