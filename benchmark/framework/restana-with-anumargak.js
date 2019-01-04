const anumargak = require('anumargak')
const service = require('restana')({
  routerFactory: (options) => {
    return anumargak(options)
  }
})

service.get("/this/is/static", function(req, res){
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

service.start(3001).then((server) => {
    console.log("server has been started on port 3001")
});