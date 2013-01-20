//<GOOGLE ANALYTICS>

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37750635-1']);
_gaq.push(['_trackPageview']);

(function() {
  "use strict";
  
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

//</GOOGLE ANALYTICS>  
 
/** Service #1 tagCloudService<br>
  * This service is in charge of parsing the HTML of the current tab and creating a tag cloud.<br>
  * Calls a model on the selected tab by sending a message to the tabs handler
  * 
  * @require content.js
  * 
  * @method tagCloudService
  * @param {Function} callback The callback function to be called once the model has returned its result.
  */
myApp.service('tagCloudService', function() {
    "use strict";

    this.createTagCloud = function(tabs, callback){
    
        //First, detect page language
        chrome.tabs.detectLanguage( null,
                                    function(language) {
                                        //Once detected, choose the appropriate black list
                                        var blacklist = WORD_BLACKLIST(language);
                                        if (typeof blacklist === "undefined"){
                                            //If language isn't supported, use the default one (English)
                                            blacklist = WORD_BLACKLIST("en");
                                        }

                                        chrome.tabs.sendMessage(tabs[0].id, { 'action': 'CreatePageTagCloud', 
                                                                              MAX_LABEL_SIZE: MAX_LABEL_SIZE, 
                                                                              MIN_LABEL_SIZE: MIN_LABEL_SIZE, 
                                                                              MAX_TAGS: MAX_TAGS,
                                                                              BLACKLIST: blacklist
                                                                            },
                                                                callback);
                                                                        
                                    });        
    };

        /** Checks if a tag cloud has been already computed for the page;
          * if it isn't call the service method to create it
          *
          */    
    this.getTagCloud = function(callback) {
        var that = this;
        
        chrome.tabs.query({'active': true},
        function (tabs) {
            
            if (tabs.length > 0)
            {                
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'CheckPageTagCloud'},
                                        function (response) {
                                            
                                            if (!response.tagCloud){
                                                that.createTagCloud(tabs, callback);
                                            }else {
                                                callback(response);
                                            }
                                        });
                
                

            }

        });
    };
});

/** Service #2 tagCloudRenderService<br>
  * This service is in charge of rendering the tag cloud.<br>
  * Calls a model on the selected tab by sending a message to the tabs handler
  *
  * 
  * @method tagCloudRenderService
  * @param {Object} model The model for the Tag Cloud.<br>
                    The Object MUST have 2 fields:
                    <ul>
                        <li>An array of tags ({Object}) created by the model</li>
                        <li>An Object with one entry for each tag, where the value associated with it 
                            indicates if the tag has been highlighted or not</li>
                    </ul>
  * @param {Number} width The width of the tag cloud DOM element.
  * @param {Number} height The height of the tag cloud DOM element.
  * @param {Function} onTagClick The callback that will be called when a tag is clicked
  * @param {Function} onTagShiftClick The callback that will be called when a tag is clicked while Shift key is pressed
  * @param {Function} onTagAltClick The callback that will be called when a tag is clicked while Alt key is pressed
  *
  * <b>WARNING</b>: The order of precedence for the event is: Shift+click, Alt+click, click
  */
myApp.service('tagCloudRenderService', 
                function() {
                    "use strict";
                    
                    this.render = function (model, width, height, onTagClick, onTagShiftClick, onTagAltClick){
                        var TAG_HIGHLIGHT_STROKE_COLOR = "black",
                            TAG_HIGHLIGHT_FILL_COLOR = "red";
                        if (!model){
                            return;
                        }
                        var tagCloud = model.tagCloud,
                            highlightedTags = model.highlightedTags;
                        var fill = d3.scale.category20();
                                        
                        d3.layout.cloud().size([width, height])
                          .words(tagCloud)
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
                                .attr("transform", "translate(" + (Math.floor(width / 2) - MIN_LABEL_SIZE/2) + "," + Math.floor(height / 2) + ")")
                              .selectAll("text")
                                .data(words)
                              .enter().append("text")
                                .attr("class", "tag")
                                .style("font-size", function(d) { return d.size + "px"; })
                                .style("font-family", "Impact")
                                .style("fill",  function(d, i) { 
                                                    return fill(i);
                                                })                  //Smaller sizes wouldn't be readable with a stroke width of 2 px 
                                .attr("stroke-width", function(d){ return d.size < (MAX_LABEL_SIZE + MIN_LABEL_SIZE) / 2 ? 1 : 2 }) 
                                .attr("stroke", function(d){
                                                    if (highlightedTags[d.text]){
                                                        return TAG_HIGHLIGHT_STROKE_COLOR;
                                                    } else {
                                                        return "none";
                                                    }
                                                })
                                .attr("text-anchor", "middle")
                                .attr("transform", function(d) {
                                  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                                })
                                .text(function(d) { return d.text; })
                                .on("click", function(d) {
                                                var tag = d.text;
                                                if (d3.event.shiftKey ) {
                                                    if (!highlightedTags[tag]) {
                                                        
                                                        d3.select(this).attr("stroke", TAG_HIGHLIGHT_STROKE_COLOR);
                                                        onTagShiftClick(tag);
                                                        highlightedTags[tag] = true;
                                                    }
                                                } else if (d3.event.altKey) {
                                                    if (highlightedTags[tag]) {
                                                        d3.select(this).attr("stroke", "none");
                                                        onTagAltClick(tag);
                                                        highlightedTags[tag] = false;
                                                    }                                                                               
                                                } else if (onTagClick && typeof(onTagClick) === 'function'){
                                                    onTagClick(tag);
                                                }
                                                
                                            });
                        } 
                    };
                });

                
myApp.service('tagHighlightService', 
                function() {
                    "use strict";
                    
                    this.highlight = 
                            function(text, highlightClassName, wordClassName) {
                            
                                chrome.tabs.query({'active': true},
                                        function (tabs) {
                                            if (tabs.length > 0) {
                                                 chrome.tabs.insertCSS(tabs[0].id, {code: "." + TAG_CLOUD_HIGHLIGH_CLASS + "{background: orange;}"});
                                                 chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightTag', 
                                                          tag: text, 
                                                          highlightClassName: highlightClassName,
                                                          wordClassName: wordClassName
                                                          
                                                        });
                                            }
                                        });
                            };
                            
                    this.removeHighlight = 
                            function(text, className) {
                            
                                chrome.tabs.query({'active': true},
                                        function (tabs) {
                                            if (tabs.length > 0) {
                                                 chrome.tabs.sendMessage(tabs[0].id, { 'action': 'RemoveHighlight', 
                                                          className: className
                                                        });
                                            }
                                        });
                            };
                            
                });

/** PageController
  *
  * Controller associated with the main div for the page.
  *
  * @method PageController
  * @param {Object} $scope The (AngularJS) scope on which the controller is called
  * @param {Object} tagCloudService The service in charge of page parsing and tag cloud creation
  *                                 (defined above, automatically passed by AngularJS)
  * @param {Object} tagCloudRenderService The service in charge of rendering the tag cloud
  *                                (defined above, automatically passed by AngularJS)
  */
myApp.controller("PageController", function ($scope, tagCloudService, tagCloudRenderService, tagHighlightService) {
    
    tagCloudService.getTagCloud(
        (function () {
            "use strict";
            
            /** @method search
              * @private
              *
              * Helper function<br>
              * Search the text in the input field with id "search_bar", using the search engine whose base
              * url for the search api is specified as first parameter.
              *
              * @param {String} search_api_url The base address of the search api for the engine that is going to be used
              */
            function search(search_api_url){
                var full_text = $.trim($("#search_bar").val()).replace(/\s+/g, "+");
                if (full_text){
                    window.open(search_api_url + full_text);
                }
                return ;
            }    
        
            //Callback callable only once
            var callback = function(model){
                
                var width = window.innerWidth;
                var height = window.innerHeight - $('#cloud_div').position().top;
                
                function wordHighlightClass(word){
                    return TAG_CLOUD_HIGHLIGH_CLASS + "-" + word;
                }
                
                tagCloudRenderService.render(model, width, height, 
                                        /**
                                          * @method onTagClick
                                          * Anonymus function: The callback that will be called when a tag is clicked
                                          */
                                        function(text){
                                            $("#search_bar").val($("#search_bar").val() + " " + text); 
                                        },
                                        /**
                                          * @method onTagShiftClick
                                          * Anonymus function: The callback that will be called 
                                          * when a tag is clicked while Shift key is pressed
                                          */                                        
                                        function(text) {
                                            tagHighlightService.highlight(text, TAG_CLOUD_HIGHLIGH_CLASS, wordHighlightClass(text));
                                            
                                        },
                                        /**
                                          * @method onTagAltClick
                                          * Anonymus function:  The callback that will be called when 
                                          * a tag is clicked while Alt key is pressed
                                          */                                            
                                        function(text) {
                                            tagHighlightService.removeHighlight(text, wordHighlightClass(text));                                        }                                        
                                    );
                                        
                        
                $("#search_button_google").click(   function(event){
                                                        search(SEARCH_API_URL["search_Google"]);
                                                    });    
                                            
                $("#search_button_twitter").click(  function(event){
                                                        search(SEARCH_API_URL["search_Twitter"]);
                                                    });   
                                            
                $("#search_button_facebook").click( function(event){
                                                        search(SEARCH_API_URL["search_Facebook"]);
                                                    });
                                            
                $("#search_button_quora").click(    function(event){
                                                        search(SEARCH_API_URL["search_Quora"]);
                                                    });    
                                            
                $("#search_button_wikipedia").click(function(event){
                                                        search(SEARCH_API_URL["search_Wikipedia"]);
                                                    });
 
                $("#search_bar").keypress(  function(event) {
                                                if ( event.which === 13 ) {
                                                    var search_engine = OptionsHandler.loadOption("search_engine");
                                                    
                                                    if (typeof SEARCH_API_URL[search_engine] === "undefined"){
                                                        search_engine = OptionsHandler.getDefaultValue("search_engine");
                                                    } 
                                                    
                                                    search(SEARCH_API_URL[search_engine]);
                                                } 
                                            });
                
                $("#clearModal_OK").click(function(event){
                                                        $("#search_bar").val("");
                                                    });
                                                    
                                    // stops modal from being shown if search bar is empty
                $('#clearModal').on('show', function (e) {
                                                if (!$("#search_bar").val()){
                                                    return e.preventDefault(); 
                                                }
                                            });              

                $('.search_button').tooltip();
                                                    
                callback = null;    //Callback callable only once

            //$scope.apply();	//Update the page, if any template tag or helper is used
            }
            
            return callback;
        
        })());

});



