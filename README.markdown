jQuery Routes
=============
**Download:** [Development](https://github.com/syntacticx/routesjs/zipball/master) | [Production (6KB)](https://github.com/syntacticx/routesjs/raw/master/jquery.routes.min.js)  
**See Also:** [jQuery View](http://viewjs.com/) | [jQuery Model](http://modeljs.com/)

Rails style routing for jQuery. Enables back button support, deep linking and allows
methods to be called by normal links in your application without adding an event handler.
Methods that have been specified in your routes will automatically set the URL of the page
when called.

    $.routes({
      "/": "PageView#home",
      "/article/:id": "ArticlesView#article",
      "/about/(:page_name)": function(params){}
    });

    Clicking: <a href="#/article/5"></a>
    Will call: ArticlesView.instance().article({id:5})
    
    Calling: ArticlesView.instance().article({id:6})
    Will set URL: "#/article/6"

jQuery Routes depends on the [jQuery Address](http://www.asual.com/jquery/address/)
plugin which is included in the production build.
