const service = require('restana')({});

service.get("/this/is/static/only", function(req, res){
    res.send("Hello");
})


service.get("/this/is/:dynamic", function(req, res){
    res.send("Hello");
})

/* service.get("/this/is/:enum(this|that)", function(req, res){
    res.send("Hello");
}) */

service.get("/this/is/versioned/static", { version: "1.2.0"}, function(req, res){
    res.send("Hello");
})

service.get("/login/as/:role(admin|staff|user)/:type(baretoken|jtoken|auth2)", function(req, res){
    res.send("Hello");
})

service.get("/this/is/:dynamic/with/:pattern(\\d+)", function(req, res){
    res.send("Hello");
})

service.start(3000).then((server) => {
    console.log("server has been started on port 3000")
});