//Avoid scope pollution and "sandbox" methods and attributes
(function initContentScript() {

    /**
      * @author Marcello La Rocca marcellolarocca@gmail.com
      * Highlights arbitrary terms assigning up to 2 custom classes to it.
      * It is possible to use regular expressions as pattern and to choose to highlight only whole words matching it.
      * The highlightClassName parameter can be used to easily remove all the highlighting in a DOM elements with one single call,
      * while the specificClassName parameter allow for highlighting each pattern with a different css style (but it is optional).
      * For each highlighted piece of text, a span is created in the original HTML document and (up to) 2 classes 
      * (highlightClassName and specificClassName)are assigned to this new tag.
      * 
      * @param {String} pattern              The string [regular expression] to highlight.
      * @param {Boolean} wholeWordOnly       True iff only whole words matching pattern should be highlighted.
      * @param {String} highlightClassName   Name of the general class assigned to highlighted words: can be used for
      *                                      styling the highlighted text or just as a mean to remove highlighting 
      *                                      altogether with a single call.
      * @param {String} [specificClassName]  Name of the specific class that must be used to style the matching text.
      *
      * Based on 
      * <http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>
      * by Johann Burkard
      *
      */
    jQuery.fn.highlight = function(pattern, wholeWordOnly, highlightClassName, specificClassName) {
        "use strict";

        var upperCasePattern = pattern.toUpperCase();
        var regex = wholeWordOnly ? new RegExp("(^" + pattern + "[\\W]+)|([\\W]+" + pattern + "[\\W]+)|([\\W]+" + pattern + "$)|(^"+ pattern + "$)", "gi") 
                                  : new RegExp(pattern, "gi");
        
        function innerHighlight(node) {
            var nodesToSkip = 0;
            var pos;
            
            if (node.nodeType === Node.TEXT_NODE) {
                if (regex.test(node.data)) {
                    
                    //If the reg exp matches the content of the node, we need to find the index of pattern inside it
                    pos = node.data.toUpperCase().indexOf(upperCasePattern);
                    
                    var spannode = document.createElement('span');
                    spannode.className = highlightClassName + (specificClassName ? " " + specificClassName : "");
                    var middlebit = node.splitText(pos);
                    var endbit = middlebit.splitText(pattern.length);
                    var middleclone = middlebit.cloneNode(true);
                    spannode.appendChild(middleclone);
                    middlebit.parentNode.replaceChild(spannode, middlebit);
                    nodesToSkip = 1;
                }
            }
            else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                for (var i = 0; i < node.childNodes.length; ++i) {
                    i += innerHighlight(node.childNodes[i]);
                }
            }
            return nodesToSkip;
        }
        
        return this.length && pattern && pattern.length ?   this.each(function() {
                                                                innerHighlight(this);
                                                            })
                                                        : this;
    };
    
    /**
      * @method removeHighlight
      *
      * @param {String} highlightClassName   Name of the class associated to highlighted words for which highlighting
      *                                      should be removed.
      */
    jQuery.fn.removeHighlight = function(highlightClassName) {
        "use strict";

        return this.find("span." + highlightClassName).each(function() {
                                                                //this.parentNode.firstChild.nodeName;
                                                                
                                                                this.parentNode.replaceChild(this.firstChild, this);
                                                                try{
                                                                    this.parentNode.normalize();
                                                                }catch(e){
                                                                    //Nothing to do
                                                                }
                                                                
                                                            }).end();
    };


    jQuery.fn.getText = function() {
        "use strict";
        
        function innerGetText(node) {
            var texts = [];
            
            if (node.nodeType === Node.TEXT_NODE) {
                    //If the reg exp matches the content of the node, we need to find the index of pattern inside it
                    texts.push(node.data);
            }
            else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                
                for (var i = 0; i < node.childNodes.length; ++i) {
                    texts.push(innerGetText(node.childNodes[i]));
                }
            }
            return texts.join(" ");
        }
        
        if (this.length > 0) {
            var results = [];
            var res;
            this.each(function() {
                results.push(innerGetText(this));
            });
            return results.join(" ");
        } else {
            return innerGetText(this);
        }
    };    
    
    
    //alert('content script loaded');
    /** @method makeFixedSizeMaxHeap
      * @private
      * Creates a FixedSizeMaxHeap.
      *
      * @param {Number} maxSize The maximum number of elements that the FixedSizeHeap can hold.
      * @return {Object}a new FixedSizeMaxHeap
      */  
    function makeFixedSizeMaxHeap(maxSize){
        "use strict";

        /** @class FixedSizeMaxHeap
          * @private
          * 
          * A set of at most maxSize elements, that will hold only the greatest maxSize elements among
          * all the elements that will be pushed in it.
          *
          * @property heap The array of elements added so far, stored as a minHeap (because the min element is going to be 
                      popped out of the heap if a greater one is pushed in it)
          * @type {Array}
          * @readonly
          * @private  
          *
          * @property maxSize The maximum number of elements that can be hold by the set
          * @type {Number}
          * @readonly
          * @private
          */
        var heap = {
            heap: [],
                    /** @method push
                      *
                      * Add a new element into the set.
                      *
                      * @param {Object} val An object adhering to the comparable interface (see Tag class).
                      * @return {Object} This FixedSizeMaxHeap object, to allow for method chaining.
                      */
            push:   function(val){
                        var heap = this.heap, 
                            n = heap.length,
                            parent, parent_pos, child_pos;

                        if (n < maxSize){
                            //heap.push(null);    //mockup
                            child_pos = n;
                            while (child_pos > 0){
                            
                                parent_pos = Math.floor((child_pos - 1) / 2);
                                
                                if (val.compare(heap[parent_pos]) < 0){
                                    heap[child_pos] = heap[parent_pos];
                                    child_pos = parent_pos;
                                }else{
                                    break;
                                }
                            }
                            
                            heap[child_pos] = val;
                            
                            //$.assert(heap.length === n + 1, "H len");
                            //this.checkRep("Non-full queue");
                            
                        }else if (heap[0].compare(val) < 0 ){
                            
                            //Push down the new element
                            parent_pos = 0;
                            child_pos = 1;
                            while (child_pos < n){
                                
                                if (child_pos + 1 < n && heap[child_pos + 1].compare(heap[child_pos]) < 0){
                                    child_pos += 1;
                                }
                                if (heap[child_pos].compare(val) < 0){
                                    heap[parent_pos]= heap[child_pos];
                                    parent_pos = child_pos;
                                    child_pos = 2 * parent_pos + 1;
                                }else{
                                    break;
                                }
                            }
                            heap[parent_pos] = val;
                            
                            //$.assert(heap.length === n, "H should be full");
                            //this.checkRep("Full queue");
                        }
                        return this;
                    },
                        /** @method checkRep
                          * @private 
                          * @require an "assert" funciton must be added to JQuery in order to call this function.
                          *
                          * Checks that the properties of the heap are not violated.
                          *
                          * @return {Object} This FixedSizeMaxHeap object, to allow for method chaining.
                          */
            checkRep:   function(msg){
                            var heap = this.heap, 
                                i = 0, j = 1, n = heap.length;        
                            while (j < n){
                                $.assert(heap[i].compare(heap[j]) <= 0, msg);
                                j += 1;
                                if (j < n){
                                    $.assert(heap[i].compare(heap[j]) <= 0, msg);
                                }
                                i += 1;
                                j = 2 * i + 1;
                            }
                            
                            return this;
                        }
        };
        return heap;
    }

    /** @class Tag
      * @private
      *
      * A tag
      * @property {String} text The text of the tag.
      * @property {String} counter The number of occurrencies of the tag inside the current page.
      */
    var tagPrototype = {
            /** @method compare
              * @for Tag
              *
              * Every Tag must adhere to a "comparable" interface: basically a "compare" method is required
              * that return a negative [positive] number if the current tag is "smaller" ["bigger"] than
              * the one to whom it is compared, or 0 if they are the same.
              *
              * @param {Object} other The tag to compare to.
              * @return {Number} <ul>
                                    <li>If the current tag is considered "bigger" than _other_, then a positive number</li>
                                    <li>If the current tag is considered "smaller" than _other_, then a negative number</li>
                                    <li>If the current tag and _other_ are equivalent, then randomly decide whether returning 
                                        a positive or negative number (so that the caller randomly decides which of the 2 tags 
                                        is going to be kept)</li>
              */
        compare: function(other){
                    "use strict";
                    
                    var r = this.counter - other.counter;
                    if (!r){
                        //assert(window.highlightedTags)
                        //Tries to give priority to the previously highlighted ones
                        
                            //WARNING: Autoconversion boolean -> int
                        r = window.highlightedTags[this.text] - window.highlightedTags[other.text];
                        
                        if (!r) {
                            //If they are still the same, randomly breaks the tie
                            return Math.random() - 0.5;
                        } else {
                            return r;
                        }
                    } else{
                        return r;
                    }
                }
    };

    /** 
      *  Creates a Tag Object
      *    
      *  @method makeTag
      *  @private
      * 
      *  @param {String} word The word to be added to the tag list.
      *  @param {Number} counter The number of occurrencies of that word inside the page.
      */
    function makeTag(word, counter){
        "use strict";
        
        var tag = Object.create(tagPrototype);
        tag.text = word;
        tag.counter = counter;
        
        return tag;
    }    
        
    /** 
        Listener (Added to chrome.extension.onMessage) for "PageTagCloud" actions.<br>
        Parses current page and creates a Tag Cloud with MAX_TAGS tags.
        
        @method PageTagCloud
      */
    chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        "use strict";
        
        if (request.action === 'CreatePageTagCloud') {
            var model, 
                //highlightedTags = {},
                tag, 
                className;
                
            var blackList = request.BLACKLIST || {};
            var tagCloud = makeFixedSizeMaxHeap(request.MAX_TAGS),
                tagCloudDict = {}, 
                minCounter = 1.7976931348623157E+10308,
                maxCounter = 0;
                
            var i, n, w,
                word_re = /^[a-z]{1}[a-z\-]*[a-z]+$/i,   //Words, at least 2 characters long, possibly separated by hiphen
                tmp = $("body").getText();
                        
                
            if (tmp){
                tmp = tmp.split(/\s+/);
                n = tmp.length;
                for (i=0; i < n; i++){
                    w = tmp[i].toLowerCase();
                    if (word_re.test(w) && !blackList[w]){
                        w = w.charAt(0).toUpperCase() + w.slice(1);
                        if (tagCloudDict[w]){
                            tagCloudDict[w] += 1;
                        }else{
                            tagCloudDict[w] = 1.0;
                        }
                    }
                }
            }
            
            if (typeof window.highlightedTags === "undefined"){
                //Init the object
                window.highlightedTags = {};
            }

            for (w in tagCloudDict){
                i = tagCloudDict[w];
                if (i > maxCounter){
                    maxCounter = i;
                }        
                tagCloud.push(makeTag(w, i));
                window.highlightedTags[w] = false || window.highlightedTags[w];
            }
            
            tagCloud = tagCloud.heap;
            
            n = tagCloud.length;
            
            if (n === 0){
                //WARNING: Do NOT save tagCloud and highlightedTags so that next time it will try again to create a tag cloud
                //          (perhaps the page wasn't completely loaded yet)
                model = {
                                tagCloud: [],
                                highlightedTags: []
                        };            
            } else {
            
                minCounter = tagCloud[0].counter;
                
                
                for (i = 0; i < n; i++){
                    tagCloud[i].size =  request.MIN_LABEL_SIZE + 
                                          Math.floor(Math.log(tagCloud[i].counter - minCounter + 1) / 
                                                      Math.log(maxCounter - minCounter + 1) * 
                                                      (request.MAX_LABEL_SIZE - request.MIN_LABEL_SIZE) );
                }
                //window.tagCloud = tagCloud;
                //window.highlightedTags = highlightedTags;
                
                model = {
                                tagCloud: tagCloud,
                                highlightedTags: window.highlightedTags
                            };
            }            
            sendResponse(model);
            
            return;
            
        } else if (request.action === 'HighlightTag') {
            tag = request.tag;
            var highlightClassName = request.highlightClassName,
                wordClassName = request.wordClassName;
            
            window.highlightedTags[tag] = true;
            $("body").highlight(tag, true, highlightClassName, wordClassName);       

            //Scroll to the first newly highlighetd word
            var firstFoundTerm = $("." + (wordClassName ? wordClassName : highlightClassName) + ":first");

            if (firstFoundTerm.length > 0) {
                var targetOffset = firstFoundTerm.offset().top;
                $('html,body').animate({scrollTop: targetOffset}, 1000);
            }

            return ;
            
        } else if (request.action === 'RemoveHighlight') {
            
            tag = request.tag;
            className = request.className;
            window.highlightedTags[tag] = false;
            
            $("body").removeHighlight(className);       

            return ;                           
        } else if (request.action === 'removeAllHighlighting') {
            className = request.className;
            $("body").removeHighlight(className);
            for (tag in window.highlightedTags){
                window.highlightedTags[tag] = false;
            }
        }
    });
})();