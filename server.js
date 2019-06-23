var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");
var app = express();
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static("public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongoosedb://localhost/ArticleScraper");
var db = mongoose.connection;

if (err) throw (err);


var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on port: " + port);
    
});