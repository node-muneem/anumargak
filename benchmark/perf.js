const Benchmark = require("benchmark");
const suite = new Benchmark.Suite("Fast routing");

const rasta = require("../src/letsRoute")();
const findMyWay = require("find-my-way")();

//Add routes to all routers
rasta.on("GET", "/this/is/static", () => 30);
rasta.on("HEAD", "/this/is/static", () => 30);
rasta.on("GET", "/this/is/:dynamic", () => 30)
rasta.on("HEAD", "/this/is/:dynamic", () => 30)
rasta.on("GET", "/this/is/:dynamic/2", () => 50)
rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
rasta.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)
rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);
rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
rasta.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

findMyWay.on("GET", "/this/is/static", () => 30);
findMyWay.on("HEAD", "/this/is/static", () => 30);
findMyWay.on("GET", "/this/is/:dynamic", () => 30)
findMyWay.on("HEAD", "/this/is/:dynamic", () => 30)
findMyWay.on("GET", "/this/is/:dynamic/2", () => 50)
findMyWay.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
findMyWay.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)
findMyWay.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);
findMyWay.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
findMyWay.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

var req = {
    method: "GET",
    url: "/this/is/static"
}
rasta.lookup(req);

suite
    .add("FIND: Fast track static", function() {
        rasta.find("GET","/this/is/static");
    })
    .add("FIND: find my way static", function() {
        findMyWay.find("GET","/this/is/static");
    })
    .add("FIND: Fast track dynamic", function() {
        rasta.find("GET","/this/is/dynamic/with/123rest");
    })
    .add("FIND: find my way dynamic", function() {
        findMyWay.find("GET","/this/is/dynamic/with/123rest");
    })
    .add("FIND: Fast track dynamic with query param", function() {
        rasta.find("GET","/this/is/dynamic/with/123rest?ignore=me");
    })
    .add("FIND: find my way dynamic with query param", function() {
        findMyWay.find("GET","/this/is/dynamic/with/123rest?ignore=me");
    })

    .add("LOOKUP: Fast track static", function() {
        var req = {
            method: "GET",
            url: "/this/is/static"
        }
        rasta.lookup(req);
    })
    .add("LOOKUP: find my way static", function() {
        var req = {
            method: "GET",
            url: "/this/is/static"
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Fast track dynamic", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest"
        }
        rasta.lookup(req);
    })
    .add("LOOKUP: find my way dynamic", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest"
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Fast track dynamic with query param", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest?ignore=me"
        }
        rasta.lookup(req);
    })
    .add("LOOKUP: find my way dynamic with query param", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest?ignore=me"
        }
        findMyWay.lookup(req);
    })
    

    .on("start", function() {
        console.log("Running Suite: " + this.name);
    })
    .on("error", function(e) {
        console.log("Error in Suite: " + this.name);
    })
    .on("abort", function(e) {
        console.log("Aborting Suite: " + this.name);
    })
    //.on('cycle',function(event){
    //    console.log("Suite ID:" + event.target.id);
    //})
    // add listeners
    .on("complete", function() {
        for (let j = 0; j < this.length; j++) {
            console.log(this[j].name + " : " + this[j].hz + " requests/second");
        }
    })
    // run async
    .run({"async": true});
