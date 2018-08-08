var Anumargak = require("./../src/letsRoute");

describe("Anumargak ", function() {
    it("FIND: should add dynamic enumetrated URLs as static for each match", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/login/as/:role(admin|user|staff)", () => 30);

        expect(anumargak.count).toEqual(1);
        expect(anumargak.find("GET","/login/as/admin")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff")()).toEqual(30);

        expect(anumargak.staticRoutes.GET["/login/as/admin"].fn()).toEqual(30);
        expect(anumargak.staticRoutes.GET["/login/as/admin"].params).toEqual({ role : "admin"});
        expect(anumargak.staticRoutes.GET["/login/as/user"].fn()).toEqual(30);
        expect(anumargak.staticRoutes.GET["/login/as/user"].params).toEqual({ role : "user"});
        expect(anumargak.staticRoutes.GET["/login/as/staff"].fn()).toEqual(30);
        expect(anumargak.staticRoutes.GET["/login/as/staff"].params).toEqual({ role : "staff"});

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(0);

    }); 

    it("LOOKUP: should add dynamic enumetrated URLs as static for each match", function(done) {
        var anumargak = Anumargak();

        var counter = 0;
        anumargak.on("GET", "/login/as/:role(admin|user|staff)", () => {
            counter++;
            if(counter === 3){
                done();
            }
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff",
            headers: {}
        });
    });

    it("FIND: should add dynamic multi enumetrated URLs as static for each match", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/login/as/:role(admin|user|staff)/:method(jtoken|bare|auth2)", () => 30);

        expect(anumargak.count).toEqual(1);
        expect(anumargak.find("GET","/login/as/admin/jtoken")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user/jtoken")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff/jtoken")()).toEqual(30);

        expect(anumargak.find("GET","/login/as/admin/bare")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user/bare")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff/bare")()).toEqual(30);

        expect(anumargak.find("GET","/login/as/admin/auth2")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user/auth2")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff/auth2")()).toEqual(30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(0);

    });

    it("LOOKUP: should add dynamic multi enumetrated URLs as static for each match", function(done) {
        var anumargak = Anumargak();

        var counter = 0;
        anumargak.on("GET", "/login/as/:role(admin|user|staff)/:method(jtoken|bare|auth2)", () => {
            counter++;
            if(counter === 9){
                done();
            }
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin/jtoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user/jtoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff/jtoken",
            headers: {}
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin/bare",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user/bare",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff/bare",
            headers: {}
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin/auth2",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user/auth2",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff/auth2",
            headers: {}
        });

    });

    it("FIND: should add dynamic multi enumetrated URLs as dynamic for each match", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/login/as/:role(admin|user|staff)/:method([a-z]+)", () => 30);

        expect(anumargak.count).toEqual(1);
        expect(anumargak.find("GET","/login/as/admin/jtoken")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user/jtoken")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff/jtoken")()).toEqual(30);

        expect(anumargak.find("GET","/login/as/admin/bare")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/user/bare")()).toEqual(30);
        expect(anumargak.find("GET","/login/as/staff/bare")()).toEqual(30);

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(3);

    });

    it("LOOKUP: should add dynamic multi enumetrated URLs as dynamic for each match", function() {
        var anumargak = Anumargak();

        var counter = 0;
        anumargak.on("GET", "/login/as/:role(admin|user|staff)/:method([a-z]+)", () => {
            counter++;
            if(counter === 9){
                done();
            }
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin/baretoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user/baretoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff/baretoken",
            headers: {}
        });

        anumargak.lookup({
            method : "GET", 
            url: "/login/as/admin/jtoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/user/jtoken",
            headers: {}
        });
        anumargak.lookup({
            method : "GET", 
            url: "/login/as/staff/jtoken",
            headers: {}
        });
    });
});
