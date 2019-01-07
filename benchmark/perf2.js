const Benchmark = require("benchmark");

const suite = new Benchmark.Suite("Routing");

const anumargak = require("../src/letsRoute")({
    ignoreTrailingSlash : true,
});
const findMyWay = require("find-my-way")({
    ignoreTrailingSlash : true
});

//Add routes to all routers
anumargak.on("GET", "/this/is/static", () => 30);
anumargak.on("HEAD", "/this/is/static", () => 30);
anumargak.on("GET", "/this/is/:dynamic", () => 30)
anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
anumargak.on("GET", "/this/is/:dynamic/2", () => 50)
anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
anumargak.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)
//anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);
//anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)
anumargak.on("GET", "/login/as/:role(admin|staff|user)/:type(baretoken|jtoken|auth2)", () => 60)
anumargak.on("GET", "/this/is/wild/and/*", () => 70)
anumargak.on("GET", "/this/is/versioned/static", { version: "1.2.0"}, () => 80)
anumargak.on("GET", "/this/is/versioned/static", { version: "1.2.3"}, () => 80)
anumargak.on("GET", "/this/is/versioned/static", { version: "2.4.0"}, () => 80)
anumargak.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "1.2.0"}, () => 90)
anumargak.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "1.2.3"}, () => 90)
anumargak.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "2.4.0"}, () => 90)

findMyWay.on("GET", "/this/is/static", () => 30);
findMyWay.on("HEAD", "/this/is/static", () => 30);
findMyWay.on("GET", "/this/is/:dynamic", () => 30)
findMyWay.on("HEAD", "/this/is/:dynamic", () => 30)
findMyWay.on("GET", "/this/is/:dynamic/2", () => 50)
findMyWay.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
findMyWay.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)
//findMyWay.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);
//findMyWay.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
findMyWay.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)
findMyWay.on("GET", "/login/as/:role(admin|staff|user)/:type(baretoken|jtoken|auth2)", () => 60)
findMyWay.on("GET", "/this/is/wild/and/*", () => 70)
findMyWay.on("GET", "/this/is/versioned/static", { version: "1.2.0"}, () => 80)
findMyWay.on("GET", "/this/is/versioned/static", { version: "1.2.3"}, () => 80)
findMyWay.on("GET", "/this/is/versioned/static", { version: "2.4.0"}, () => 80)
findMyWay.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "1.2.0"}, () => 90)
findMyWay.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "1.2.3"}, () => 90)
findMyWay.on("GET", "/this/is/versioned/:dynamic([0-9])", { version: "2.4.0"}, () => 90)

/* console.log(anumargak.find("GET","/login/as/user/auth2"));
console.log(findMyWay.find("GET","/login/as/user/auth2").handler); */

suite
    .add("QUICKFIND: Anumargak static", function() {
        anumargak.quickFind("GET","/this/is/static");
    })
    .add("QUICKFIND: Anumargak dynamic", function() {
        anumargak.quickFind("GET","/this/is/dynamic/with/123rest");
    })
    .add("QUICKFIND: Anumargak dynamic with query param", function() {
        anumargak.quickFind("GET","/this/is/dynamic/with/123rest?ignore=me");
    })
    .add("QUICKFIND: Anumargak enum", function() {
        anumargak.quickFind("GET","/login/as/user/auth2");
    })
    .add("QUICKFIND: Anumargak wildchar", function() {
        anumargak.quickFind("GET","/this/is/wild/and/*");
    })

    .add("FIND: Anumargak static", function() {
        anumargak.find("GET","/this/is/static");
    })
    .add("FIND: find my way static", function() {
        findMyWay.find("GET","/this/is/static");
    })
    .add("FIND: Anumargak static with query param", function() {
        anumargak.find("GET","/this/is/static?ignore=me");
    })
    .add("FIND: find my way static with query param", function() {
        findMyWay.find("GET","/this/is/static?ignore=me");
    })

    .add("FIND: Anumargak dynamic", function() {
        anumargak.find("GET","/this/is/dynamic/with/123rest");
    })
    .add("FIND: find my way dynamic", function() {
        findMyWay.find("GET","/this/is/dynamic/with/123rest");
    })
    .add("FIND: Anumargak dynamic with query param", function() {
        anumargak.find("GET","/this/is/dynamic/with/123rest?ignore=me");
    })
    .add("FIND: find my way dynamic with query param", function() {
        findMyWay.find("GET","/this/is/dynamic/with/123rest?ignore=me");
    })
    .add("FIND: Anumargak enum", function() {
        anumargak.find("GET","/login/as/user/auth2");
    })
    .add("FIND: find my way enum", function() {
        findMyWay.find("GET","/login/as/user/auth2");
    })
    .add("FIND: Anumargak wildchar", function() {
        anumargak.find("GET","/this/is/wild/and/*");
    })
    .add("FIND: find my way wildchar", function() {
        findMyWay.find("GET","/this/is/wild/and/*");
    })
    .add("FIND: Anumargak versioned static", function() {
        anumargak.find("GET","/this/is/versioned/static", "1.2.0");
        anumargak.find("GET","/this/is/versioned/static", "1.2.x");
        anumargak.find("GET","/this/is/versioned/static", "1.x");
        anumargak.find("GET","/this/is/versioned/static", "*");
    })
    .add("FIND: find my way versioned static", function() {
        findMyWay.find("GET","/this/is/versioned/static", "1.2.0");
        findMyWay.find("GET","/this/is/versioned/static", "1.2.x");
        findMyWay.find("GET","/this/is/versioned/static", "1.x");
        findMyWay.find("GET","/this/is/versioned/static", "*");
    })
    .add("FIND: Anumargak versioned dynamic", function() {
        anumargak.find("GET","/this/is/versioned/1", "1.2.0");
        anumargak.find("GET","/this/is/versioned/1", "1.2.x");
        anumargak.find("GET","/this/is/versioned/1", "1.x");
        anumargak.find("GET","/this/is/versioned/1", "*");
    })
    .add("FIND: find my way versioned dynamic", function() {
        findMyWay.find("GET","/this/is/versioned/1", "1.2.0");
        findMyWay.find("GET","/this/is/versioned/1", "1.2.x");
        findMyWay.find("GET","/this/is/versioned/1", "1.x");
        findMyWay.find("GET","/this/is/versioned/1", "*");
    })

    .add("LOOKUP: Anumargak static", function() {
        var req = {
            method: "GET",
            url: "/this/is/static",
            headers : {}
        }
        anumargak.lookup(req);
    })
    .add("LOOKUP: find my way static", function() {
        var req = {
            method: "GET",
            url: "/this/is/static",
            headers : {}
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Anumargak dynamic", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest",
            headers : {}
        }
        anumargak.lookup(req);
    })
    .add("LOOKUP: find my way dynamic", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest",
            headers : {}
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Anumargak dynamic with query param", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest?ignore=me",
            headers : {}
        }
        anumargak.lookup(req);
    })
    .add("LOOKUP: find my way dynamic with query param", function() {
        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest?ignore=me",
            headers : {}
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Anumargak enum", function() {
        var req = {
            method: "GET",
            url: "/login/as/user/auth2",
            headers : {}
        }
        anumargak.lookup(req);
    })
    .add("LOOKUP: find my way enum", function() {
        var req = {
            method: "GET",
            url: "/login/as/user/auth2",
            headers : {}
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Anumargak wildchar", function() {
        var req = {
            method: "GET",
            url: "/this/is/wild/and/*",
            headers : {}
        }
        anumargak.lookup(req);
    })
    .add("LOOKUP: find my way wildchar", function() {
        var req = {
            method: "GET",
            url: "/this/is/wild/and/*",
            headers : {}
        }
        findMyWay.lookup(req);
    })
    .add("LOOKUP: Anumargak versioned/static", function() {
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.2.0"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.2.x"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.x"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "*"
            }
        });
    })
    /* .add("LOOKUP: find my way versioned/static", function() {
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.2.0"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.2.x"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "1.x"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/static",
            headers : {
                "accept-version" : "*"
            }
        });
    }) */
    .add("LOOKUP: Anumargak versioned/dynamic", function() {
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.2.0"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.2.x"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.x"
            }
        });
        anumargak.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "*"
            }
        });
    })
    .add("LOOKUP: find my way versioned/dynamic", function() {
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.2.0"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.2.x"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "1.x"
            }
        });
        findMyWay.lookup({
            method: "GET",
            url: "/this/is/versioned/1",
            headers : {
                "accept-version" : "*"
            }
        });
    })
    

    .on("start", function() {
        console.log("Running Suite: " + this.name);
    })
    .on("error", function(e) {
        console.log("Error in Suite: " + this.name);
        console.log(e);
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
