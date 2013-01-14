var MAX_LABEL_SIZE = 60,
    MIN_LABEL_SIZE = 12;
var MAX_TAGS = 100; 
var GOOGLE_SEARCH_API_URL = "http://www.google.com/search?q=",
    TWITTER_SEARCH_API_URL = "https://twitter.com/search?q=",
    FACEBOOK_SEARCH_API_URL = "https://www.facebook.com/search/results.php?q=",
    QUORA_SEARCH_API_URL = "http://api.quora.com/search?q=";

    
/** Service #1 tagCloudService
  * This service is in charge of parsing the HTML of the current tab and creating a tag cloud.
  * Calls a model on the selected tab by sending a message to the tabs handler
  * 
  * @require content.js
  * 
  * @method tagCloudService
  * @param {Function} callback The callback function to be called once the model has returned its result.
  */
myApp.service('tagCloudService', function() {
    this.getInfo = function(callback) {
        var model = {};

        chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {
                model.title = tabs[0].title;
                model.url = tabs[0].url;

                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageTagCloud', MAX_LABEL_SIZE: MAX_LABEL_SIZE, MIN_LABEL_SIZE: MIN_LABEL_SIZE, MAX_TAGS: MAX_TAGS }, function (response) {
                    
                    model.tagCloud = response;
                    callback(model);
                });
            }

        });
    };
});

/** Service #2 tagCloudRender
  * This service is in charge of rendering the tag cloud.
  * Calls a model on the selected tab by sending a message to the tabs handler
  *
  * 
  * @method tagCloudRender
  * @param {Array} tags The array of tags ({Object}) created by the model.
  * @param {Number} width The width of the tag cloud DOM element.
  * @param {Number} height The height of the tag cloud DOM element.
  * @param {Function} onTagClick The callback that will be called when a tag is clicked
  */
myApp.service('tagCloudRender', function() {
    this.render = function (tags, width, height, onTagClick){
        if (!tags){
            return;
        }
        var fill = d3.scale.category20();
                        
        d3.layout.cloud().size([width, height])
          .words(tags)
          .rotate(function() { return ~~(Math.random() * 2) * 90; })
          .font("Impact")
          .fontSize(function(d) { return d.size; })
          .on("end", draw)
          .start();

        function draw(words) {
            d3.select("#cloud_div").append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + (Math.floor(width / 2) - MIN_LABEL_SIZE) + "," + Math.floor(height / 2) + ")")
              .selectAll("text")
                .data(words)
              .enter().append("text")
                .attr("class", "tag")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; })
                .on("click", function(d) {
                    if (onTagClick && typeof(onTagClick) === 'function'){
                        onTagClick(d.text);
                    }
                });
        } 
    };
});

/** PageController
  *
  * Controller of the 
  *
  * @method PageController
  * @param {Object} $scope The (AngularJS) scope on which the controller is called
  * @param {Object} tagCloudService The service in charge of page parsing and tag cloud creation
  *                                 (defined above, automatically passed by AngularJS)
  * @param {Object} tagCloudRender The service in charge of rendering the tag cloud
  *                                (defined above, automatically passed by AngularJS)
  */
myApp.controller("PageController", function ($scope, tagCloudService, tagCloudRender) {
    
    tagCloudService.getInfo(function (info) {
        //Callback callable only once
        var callback = function(){
            
            var width = window.innerWidth;
            var height = window.innerHeight - $('#search_bar').height();            
            tagCloudRender.render(info.tagCloud, width, height, 
                                    function(text){
                                        $("#search_bar").val($("#search_bar").val() + " " + text); 
                                    });
                                    
                    
            $("#search_button_google").click(  function(event){
                                            var full_text = $.trim($("#search_bar").val());
                                            if (full_text){
                                                window.open(GOOGLE_SEARCH_API_URL + full_text);
                                            }
                                        });    
                                        
            $("#search_button_twitter").click(  function(event){
                                            var full_text = $.trim($("#search_bar").val());
                                            if (full_text){
                                                window.open(TWITTER_SEARCH_API_URL + full_text);
                                            }
                                        });   
                                        
            $("#search_button_facebook").click(  function(event){
                                            var full_text = $.trim($("#search_bar").val());
                                            if (full_text){
                                                window.open(FACEBOOK_SEARCH_API_URL + full_text);
                                            }
                                        });
                                        
            $("#search_button_quora").click(  function(event){
                                            var full_text = $.trim($("#search_bar").val());
                                            if (full_text){
                                                window.open(QUORA_SEARCH_API_URL + full_text);
                                            }
                                        });
            
            callback = null;    //Callback callable only once
        }
        
        if (callback){
            callback();
        }
    });

});



