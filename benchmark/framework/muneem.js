const app = require('muneem')();

app.route({
    url: "/this/is/static",
    to: function(req, res){
        res.write("Hello");
        res.end();
    }
})

app.route({
    url: "/login/as/:role(admin|staff|user)/:type(baretoken|jtoken|auth2)",
    to: function(req, res){
        res.write("Hello");
        res.end();
    }
})

app.route({
    url: "/this/is/:dynamic/with/:pattern(\\d+)",
    to: function(req, res){
        res.write("Hello");
        res.end();
    }
})

app.start(3002);
