var MAX_LABEL_SIZE = 60,
    MIN_LABEL_SIZE = 12;
var MAX_TAGS = 100;

    /** @property WORD_BLACKLIST
      * @type {Object}
      * @readOnly
      * @private
      * Sublist of the 100 most common words used in English.<br>
      * Used to avoid including them in the tag cloud.
      */
var WORD_BLACKLIST =    {   "the": true, "or": true, "and": true, "for": true, "you": true, "your": true, "our": true,
                            "yours": true, "ours": true, "mine": true, "my": true, "that": true,
                            "this": true, "those": true, "these": true, "has": true, "have": true, "had": true, 
                            "are": true, "am": true, "not": true, "no": true, "but": true, "his": true, "her": true, 
                            "him": true, "its": true, "in": true, "into": true, "my": true, "who": true, "us": true, 
                            "which": true, "when": true, "how": true, "date": true, "day": true, "with": true,
                            "on": true, "an": true, "a": true
                        }

var SEARCH_API_URL = {  "search_Google" : "http://www.google.com/search?q=",
                        "search_Twitter" : "https://twitter.com/search?q=",
                        "search_Facebook" : "https://www.facebook.com/search/results.php?q=",
                        "search_Quora" : "http://api.quora.com/search?q=",
                        "search_Wikipedia" : "http://wikipedia.org/w/index.php?search="
                    };
                    
var TRANSLATE_API_URL = {  "translate_Google" : "http://translate.google.it/#auto/" };

var ALLOWED_LANGUAGES = {"en": true, "fr": true, "it": true, "de": true, "ru": true, "es": true, "pt": true, "ch": true, "jp":true};