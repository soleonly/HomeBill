var express = require('express');
var router = express.Router();

var data = {
    title: "block test",
    layout: "layout/contentCol1",
    currency: {
        name: "united states dollars",
        abbrev: "USD"
    },
    tours: [
        {name: "HoodRiver", price: "$99.01"},
        {name: "Oregon", price: "$199"}
    ],
    apecialsUrl: "/January-specials",
    currencies: ["USD", "GBP", "BTC"]
}
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('block', data);
});

module.exports = router;
