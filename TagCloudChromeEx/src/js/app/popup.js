//<GOOGLE ANALYTICS>

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37750635-1']);
_gaq.push(['_trackPageview']);

(function() {
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
    this.getInfo = function(callback) {
        var model = {};

        chrome.tabs.query({'active': true},
        function (tabs) {
            var blacklist;
            
            if (tabs.length > 0)
            {
                model.title = tabs[0].title;
                model.url = tabs[0].url;
                
                //First, detect page language
                chrome.tabs.detectLanguage( null,
                                            function(language) {
                                                //Once detected, choose the appropriate black list
                                                blacklist = WORD_BLACKLIST(language);
                                                if (typeof blacklist === "undefined"){
                                                    //If language isn't supported, use the default one (English)
                                                    blacklist = WORD_BLACKLIST("en");
                                                }

                                                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageTagCloud', 
                                                          MAX_LABEL_SIZE: MAX_LABEL_SIZE, 
                                                          MIN_LABEL_SIZE: MIN_LABEL_SIZE, 
                                                          MAX_TAGS: MAX_TAGS,
                                                          BLACKLIST: blacklist
                                                        },
                                                function (response) {
                                                    
                                                    model.tagCloud = response;
                                                    callback(model);
                                                });
                                            
                                            });
                

            }

        });
    };
});

/** Service #2 tagCloudRender<br>
  * This service is in charge of rendering the tag cloud.<br>
  * Calls a model on the selected tab by sending a message to the tabs handler
  *
  * 
  * @method tagCloudRender
  * @param {Array} tags The array of tags ({Object}) created by the model.
  * @param {Number} width The width of the tag cloud DOM element.
  * @param {Number} height The height of the tag cloud DOM element.
  * @param {Function} onTagClick The callback that will be called when a tag is clicked
  */
myApp.service('tagCloudRender', 
                function() {

                    this.render = function (tags, width, height, onTagClick, onTagShiftClick){
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
                                .attr("transform", "translate(" + (Math.floor(width / 2) - MIN_LABEL_SIZE/2) + "," + Math.floor(height / 2) + ")")
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
                                                var tag = d.text;
                                                if (d3.event.shiftKey) {
                                                    onTagShiftClick(tag);
                                                } else if (onTagClick && typeof(onTagClick) === 'function'){
                                                    onTagClick(tag);
                                                }
                                                
                                            });
                        } 
                    };
                });

                
myApp.service('tagHighlight', 
                function() {

                    this.highlight = 
                            function(text, className) {
                            
                                chrome.tabs.query({'active': true},
                                        function (tabs) {
                                            if (tabs.length > 0) {
                                                 chrome.tabs.insertCSS(tabs[0].id, {code: "." + TAG_CLOUD_HIGHLIGH_CLASS + "{background: orange;}"});
                                                 chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightTag', 
                                                          tag: text, 
                                                          className: className
                                                        });
                                            }
                                        });
                            
                                /*
                                var that = this;
                                var regex = new RegExp(text, "gi");
                                
                                    jQueryNode.each(function () {
                                        this.innerHTML = this.innerHTML.replace(regex, function(matched) {
                                            return "<span class=\"" + className + "\">" + matched + "</span>";
                                        });
                                    });
/*                                    
                                if  (jQueryNode.nodeType === Node.TEXT_NODE && regex.test(this.nodeValue)){

                                }else {
                                    jQueryNode.children().each( function(){
                                                                    that.highlight($(this), text, className);
                                                                });
                                }*/
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
  * @param {Object} tagCloudRender The service in charge of rendering the tag cloud
  *                                (defined above, automatically passed by AngularJS)
  */
myApp.controller("PageController", function ($scope, tagCloudService, tagCloudRender, tagHighlight) {
    
    tagCloudService.getInfo(
        (function () {
        
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
            var callback = function(info){
                var highlightedWords = {};
                var width = window.innerWidth;
                var height = window.innerHeight - $('#cloud_div').position().top;            
                tagCloudRender.render(info.tagCloud, width, height, 
                                        function(text){
                                            $("#search_bar").val($("#search_bar").val() + " " + text); 
                                        },
                                        function(text) {
                                            if (typeof highlightedWords[text] === "undefined"){
                                                tagHighlight.highlight(text, TAG_CLOUD_HIGHLIGH_CLASS);
                                            }
                                        }
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



