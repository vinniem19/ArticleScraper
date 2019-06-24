var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/Comment.js");
var Article = require("../models/Articles.js");

router.get("/", function(req,res) {
    res.redirect("/articles");
});

// route for scraping from the verge website
router.get("/scrape", function(req, res) {
    request("http://www.theverge.com", function(error, response, html) {
        var $ = cheerio.load(html);
        var titlesArray = [];
        $(".c-entry-box--compact__title").each(function(i, element) {
            var result = {}; 
            result.title = $(this)
            .children("a")
            .text();

            result.link = $(this)
            .children("a")
            .attr("href");

            // make sure info is there and available for scraping
            if(result.title !== "" && result.link !=="") {

                if(titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);
                Article.count({title: result.title}, function(err,test){
                    if (test === 0) {
                        var entry = new Article(result);
                        entry.save(function(err, doc){
                            if(err) {
                                console.log(err);
                            } else {
                                console.log(doc);
                                
                            }
                        })
                    }
                })
                } else {
                    console.log("Article already exists.");
                }

            } else {
                console.log("Not saved to db . . .missing data");
            }
        });
        res.redirect("/");
    });
});

// get the articles and render them on the page for user
router.get("/articles", function(req, res) {
    Article.find().sort({_id: -1}).exec(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            var artcl = {Articles: doc};
            console.log("Articles: ",artcl);
            
            res.render("index", artcl);
        }
    });
});

// get the articles as json 
router.get("/articles-json", function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});


// clear out the db if wanted
    router.get("/clearAll", function(req, res) {
        Article.remove({}, function(err, doc) {
            if(err) {
                console.log(err);
            } else {
                console.log("removed all articles.");
            }
        });
        res.redirect("/articles-json");
    });

    // get an article by id and 
    router.get("/readArticle/:id", function(req, res) {
        var articleId = req.params.id;
        var hbsObj = {
            article: [],
            body: []
        };

    Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function(err, doc) {
        if (err) {
            console.log("error: " + err);
        } else {
            hbsObj.article = doc;
            var link = doc.link;
            request(link, function(error, response, html) {
                var $ = cheerio.load(html);

                $(".l-col__main").each(function(i, element) {
                    hbsObj.body = $(this)
                    .children(".c-entry-content")
                    .children("p")
                    .text();

                    res.render("article", hbsObj);
                    return false;
                });
            });
        }
    });
});

    // route for user to create comments
    router.post("/comment/:id", function(req,res) {
        var user = req.body.name;
        var content = req.body.comment;
        var articleId = req.params.id;

        var commentObj = {
            name: user,
            body: content
        };
        var newComment = new Comment(commentObj);
        newComment.save(function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                console.log(doc._id);
                console.log(articleId);

                Article.findOneAndUpdate(
                    {_id: req.params.id },
                    { $push: { comment: doc._id} },
                    {new: true }
                ).exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/readArticle/" + articleId);
                    }
                });
            }
        });
    });


module.exports = router;

// Whenever a user visits your site, the app should scrape stories from a news outlet of your choice and display them for the user. 
        // I'll try Yahoo News.

// This will be initiated with Mongodb.

// Each scraped article should be saved to your application database. At a minimum, the app should scrape and display the following information for each article

     // Headline - the title of the article
        // console.log the object

     // Summary - a short summary of the article

     // URL - the url to the original article

     // Feel free to add more content to your database (photos, bylines, and so on).

// Users should also be able to leave comments on the articles displayed and revisit them later. 

// The comments should be saved to the database as well and associated with their articles. 

// Users should also be able to delete comments left on articles. 

// All stored comments should be visible to every user.