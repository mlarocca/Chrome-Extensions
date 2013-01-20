jQuery.fn.highlight = function(pattern, wholeWordOnly, highlightClassName, specificClassName) {
    var upperCasePattern = pattern.toUpperCase();
    var regex = wholeWordOnly ? new RegExp("(^" + pattern + "[\\W]+)|([\\W]+" + pattern + "[\\W]+)|([\\W]+" + pattern + "$)|(^"+ pattern + "$)", "gi") 
                              : new RegExp(pattern, "gi");
    
    function innerHighlight(node) {
        var skip = 0;
        
        
        if (node.nodeType == Node.TEXT_NODE) {
            var pos = node.data.regexIndexOf(regex);
            if (pos >= 0) {
                if (wholeWordOnly){
                    pos = node.data.toUpperCase().indexOf(upperCasePattern);
                }
                
                var spannode = document.createElement('span');
                spannode.className = highlightClassName + (specificClassName ? " " + specificClassName : "");
                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(pattern.length);
                var middleclone = middlebit.cloneNode(true);
                spannode.appendChild(middleclone);
                middlebit.parentNode.replaceChild(spannode, middlebit);
                skip = 1;
            }
        }
        else if (node.nodeType == Node.ELEMENT_NODE && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; ++i) {
                i += innerHighlight(node.childNodes[i]);
            }
        }
        return skip;
    }
    
    return this.length && pattern && pattern.length ?   this.each(function() {
                                                            innerHighlight(this);
                                                        })
                                                    : this;
};

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

jQuery.fn.removeHighlight = function(highlightClassName) {
    return this.find("span." + highlightClassName).each(function() {
                                                            this.parentNode.firstChild.nodeName;
                                                            with (this.parentNode) {
                                                                replaceChild(this.firstChild, this);
                                                                normalize();
                                                            }
                                                        }).end();
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
                var r = this.counter - other.counter;
                if (!r){
                    return Math.random() - 0.5;
                }
                else{
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
    
    if (request.action === 'PageTagCloud') {
        var tagCloud = makeFixedSizeMaxHeap(request.MAX_TAGS);
        var blackList = request.BLACKLIST || {};
        
        var tagCloudDict = {}, 
            minCounter = 1.7976931348623157E+10308,
            maxCounter = 0;
        var i, n, w,
            word_re = /^[a-z]{1}[a-z\-]*[a-z]+$/i,   //Words, at least 2 characters long, possibly separated by hiphen
            tmp = $("body").text();
       
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

        for (w in tagCloudDict){
            i = tagCloudDict[w];
            if (i > maxCounter){
                maxCounter = i;
            }        
            tagCloud.push(makeTag(w, i));
        }
        
        tagCloud = tagCloud.heap;
        
        n = tagCloud.length;
        
        if (n === 0){
            sendResponse([]);
            return;
        }//else
        
        minCounter = tagCloud[0].counter;
        
        
        for (i = 0; i < n; i++){
            tagCloud[i].size =  request.MIN_LABEL_SIZE + 
                                  Math.floor(Math.log(tagCloud[i].counter - minCounter + 1) / 
                                              Math.log(maxCounter - minCounter + 1) * 
                                              (request.MAX_LABEL_SIZE - request.MIN_LABEL_SIZE) );
        }
        
        sendResponse(tagCloud);
    } else if (request.action === 'HighlightTag') {
        var tag = request.tag;
        var className = request.className;
        
        $("body").highlight(tag, true, className);       

        var firstFoundTerm = $("." + className + ":first");
        if (firstFoundTerm.length > 0) {
             $('html').scrollTop(firstFoundTerm.offset().top);
        }
                                   
    }
});