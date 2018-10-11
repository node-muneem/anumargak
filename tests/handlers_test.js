var Anumargak = require("./../src/letsRoute");
const MockRes = require('mock-res');

describe("Anumargak ", function() {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    it("should execute series of the handlers until the response is sent", function(done) {
        var router = Anumargak();

        const seq = [];
        router.on("GET", "/this/is/static", [
            () => {
                seq.push(1);
            }, async function (){
                await sleep(200);
                seq.push(2);
            }, function (req, res){
                seq.push(3);
                res.write( JSON.stringify(seq) );
                res.end();
            }, function (){
                seq.push(4);
                done.fail();
            }
        ]);

        var req = {
            method: "GET",
            url: "/this/is/static",
            headers: {}
        }

        var res = new MockRes();

        res.on('finish', function() {
            expect(res._getString() ).toEqual("[1,2,3]");
            expect(res.statusCode ).toEqual(200);
            done();
        });

        router.lookup(req, res);

    });
});