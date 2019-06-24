var mongoose = require("mongoose");
var express = require("express");
var app = express();
var routes = require("./controller/controller");



var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(routes);

// mongoose.connect("mongoosedb://localhost/ArticleScraper");
var db = process.env.MONGODB_URI || "mongodb://localhost/ArticleScraper";
mongoose.connect(db, { useNewUrlParser: true });

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Listening on port: " + port);

});