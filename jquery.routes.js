//
// jQuery Routes v1.0
// http://routesjs.com/
// 
// Copyright (c) 2011 Ryan Johnson
// http://syntacticx.com/
// 
// Released under the MIT license.
//
// jQuery Address Plugin v1.3.1
// http://www.asual.com/jquery/address/
// 
// Copyright (c) 2009-2010 Rostislav Hristov
// Dual licensed under the MIT or GPL Version 2 licenses.
// http://jquery.org/license

/* 
 * jQuery Routes
 * =============
 */ 
(function($,context){
  
  if(Number($.fn.jquery.replace(/\./g)) < 143){
    throw 'jQuery Routes requires jQuery 1.4.3 or later.';
  }
  
  /* Maps urls to method calls and method calls to urls. This enables back button
   * support, deep linking and allows methods to be called by normal links
   * in your application without adding event handlers or additional code to each link.
   * 
   *     $.routes({
   *       "/": "PageView#home",
   *       "/article/:id": "ArticlesView#article"
   *     });
   *     
   *     //PageView.instance().home() automatically called 
   *     
   *     $.routes("set","/article/5");
   *     //ArticlesView.instance().article({id:5}) automatically called
   *     
   *     ArticlesView.instance().article({id:6});
   *     //$.routes("set","/article/6"); automatically called
   * 
   * Methods
   * -------
   * 
   * ### $.routes*(Object routes \[,Boolean lazy_loading = false\]) -> null*
   * Calling routes will start routes in your appliction, dispatching the current
   * address present in the url bar of the browser. If no address is present on
   * the page **$.routes("set","/")** will automatically be called.
   * 
   * Setting **lazy_loading** to true will prevent your callbacks from being setup for
   * to automatically set the path and will prevent **instance** from being called
   * on each specified object. This is useful in large applications where you do
   * not want all views with routes initialized when $.routes starts. You can
   * manually setup each callback using **$.routes("setup",callback)**
   * 
   *     $.routes({
   *       "/": "PageView#home",
   *       "/article/:id": "ArticlesView#article",
   *       "/about/(:page_name)": "PageView#page",
   *       "/wiki/*": "WikiView#page",
   *       "/class_method": "Object.method",
   *       "/callback": function(){}
   *     });
   * 
   * Supported types of paths:
   * 
   * - "/" - A plain path with no parameters.
   * - "/article/:id" - A path with a required named parameter.
   * - "/about/(:page_name)" - A path with an optional named paramter.
   * - "/wiki/\*" - A path with an asterix / wildcard.
   * 
   * Supported types of callbacks:
   * 
   * - "PageView#home" - Will call PageView.instance().home()
   * - "Object.method" - Will call Object.method()
   * - function(){} - Will call the specified function.
   * 
   */
  $.routes = function(routes,lazy_loading){
    if(typeof($.address) == 'undefined'){
      throw 'jQuery Address (http://www.asual.com/jquery/address/) is required to run jQuery View Routes';
    }
    if(typeof(routes) == 'string'){  
      var method_name = routes;
      if(method_name == 'start'){
        return start();
      }
      if(method_name == 'stop'){
        return stop();
      }
      if(method_name == 'match'){
        return match(arguments[1]);
      }
      if(method_name == 'set'){
        return set(arguments[1]);
      }
      if(method_name == 'get'){
        return get();
      }
      if(method_name == 'url'){
        return url(arguments[1],arguments[2]);
      }
      if(method_name == 'setup'){
        return url(arguments[1]);
      }
      if(method_name == 'add'){
        return url(arguments[1],arguments[2]);
      }
      throw method_name + ' is not a supported method.';
    }else{
      set_routes(routes);
      if(!lazy_loading){
        for(var i = 0; i < routes.length; ++i){
          setup(routes[i][1],i);
        }
      }
    }
  };
  
  /* ### $.routes("url"*, String callback \[,Object params\]*) *-> String*
   * Generates a url for a route.
   * 
   *     var url = $.routes("url","ArticlesView#article",{id:5});
   *     url == "/article/5"
   */
  function url(class_and_method,params){
    for(var i = 0; i < routes.length; ++i){
      if(routes[i][1] == class_and_method){
        return generate_url(routes[i][0],params);
      }
    }
    return false;
  };
  
  /* ### $.routes("get") *-> String*
   * Returns the current address / path.
   */
  function get(){
    var path_bits = window.location.href.split('#');
    return path_bits[1] && (path_bits[1].match(/^\//) || path_bits[1] == '') ? path_bits[1] : '';
  };
  
  /* ### $.routes("set") *-> null*
   * Sets the current address / path, calling the matched route if a match is found.
   * 
   *     $.routes("set","/article/5");
   */
  function set(path,force){
    var matched_path = match(path);
    var should_dispatch = path != current_route;
    if(!should_dispatch && force == true){
      should_dispatch = true;
    }
    if(enabled && should_dispatch && matched_path){
      matched_path[0] = setup(matched_path[0],matched_path[2]);
      if(!('callOriginal' in matched_path[0])){
        set_address(path);
      }
      $.routes.history.push([path,matched_path[0],matched_path[1]]);
      $.routes.dispatcher(matched_path[0],matched_path[1],path);
      return true;
    }else{
      return false;
    }
  };
  
  /* ### $.routes("add"*, String path, String callback*) *-> null*
   * Add a new route.
   * 
   *     $.routes("add","/article/:id","ArticlesView#article");
   */
  function add(path,callback){
    routes.push([path,callback]);
    route_patterns.push(route_matcher_regex_from_path(path));
  };
  
  /* ### $.routes("match"*, String path*) *-> Array \[Function callback, Object params\]*
   *     var match = $.routes("match","/article/5");
   *     match[0](match[1]);
   */
  function match(path){
    for(var i = 0; i < routes.length; ++i){
      if(routes[i][0] == path){
        return [setup(routes[i][1],i),{},i];
      }
    }
    for(var i = 0; i < route_patterns.length; ++i){
      var matches = route_patterns[i][0].exec(path);
      if(matches){
        var params = {};
        for(var ii = 0; ii < route_patterns[i][1].length; ++ii){
          params[route_patterns[i][1][ii]] = matches[((ii + 1) * 3) - 1];
        }
        return [setup(routes[i][1],i),params,i];
      }
    }
    return false;
  };
  
  /* ### $.routes("setup"*, String callback*) *-> null*
   * If lazy loading is enabled each callback will need to be setup to enable
   * the automatic call to $.routes("set",path) when the callback is invoked.
   * 
   *     $.routes("setup","ArticlesView#article");
   *     ArticlesView.instance().article({id:5});
   *     $.routes("get") == "/article/5"
   */
  function setup(callback,index_of_route){
    if(typeof(callback) == 'string' && typeof(index_of_route) == 'undefined'){
      for(var i = 0; i < routes.length; ++i){
        if(routes[i][1] == callback){
          index_of_route = i;
          break; 
        }
      }
      throw 'Method ' + callback + ' not found in specified routes.';
    }
    //context var comes from outer plugin wrapper and usually refers to window
    if(typeof(callback) == 'function'){
      return callback;
    }
    var path = routes[index_of_route][0];
    var method_name = callback.match(/\#(.+)$/)[1];
    var object_name_bits = callback.replace(/\#.+$/,'').split('.');
    //context was set by the outer function wrapper and usually refers to window
    var object = context[object_name_bits[0]];
    for(var i = 1; i < object_name_bits.length; ++i){
      object = object[object_name_bits[i]];
    }
    object = object.instance();
    if('callOriginal' in object[method_name]){
      return object[method_name];
    }
    var original_method = object[method_name];
    if(typeof(object[method_name]) == 'undefined'){
      throw 'The method "' + method_name + '" does not exist for the route "' + path + '"';
    }
    object[method_name] = function routing_wrapper(params){
      set_address(generate_url(path,params));
      original_method.apply(object,arguments);
    };
    object[method_name].callOriginal = function original_method_callback(){
      return original_method.apply(object,arguments);
    };
    return object[method_name];
  };
  
  /* ### $.routes("stop") *-> null*
   * Stops the routing plugin from handling changes in the page address.
   */
  function stop(){
    enabled = false;
  };
  
  /* ### $.routes("start") *-> null*
   * Called implicitly when you specify your routes. Only necessary if **stop** has been called.
   */
  function start(){
    if(!start_observer && !ready){
      start_observer = $(document).ready(function document_ready_observer(){
        $.address.bind('externalChange',external_change_handler);
        ready = true;
        enabled = true;
        if(!set(get(),true)){
          set('/');
        }
      });
    }else{
      ready = true;
      enabled = true;
    }
  };
  
  /* Properties
   * ----------
   * ### $.routes.dispatcher *-> Function*
   * The **dispatcher** property is a function invoked each time the route / path changes.
   * It is called with Function callback, Object params, String path. The default dispatcher
   * calls the callback with the params.
   * 
   *     $.routes.dispatcher = function(callback,params,path){
   *       callback(params);
   *     };
   */ 
  $.routes.dispatcher = function dispatcher(callback,params,path){
    callback(params);
  };
  
  /*
   * ### $.routes.history *-> Array*
   * The history array contains a list of dispatched routes since $.routes was initialized.
   * Each item in the array is an array containing \[String path,Function callback,Object params\] 
   */
  $.routes.history = [];
  
  //private attributes
  var start_observer = false;
  var ready = false;
  var routes = []; //array of [path,method]
  var route_patterns = []; //array of [regexp,param_name_array]
  var current_route = false;
  var enabled = false;
  
  //private methods
  function set_routes(routes){
    for(var path in routes){
      add(path,routes[path]);
    }
    start();
  };
  
  function route_matcher_regex_from_path(path){
    var params = [];
    var reg_exp_pattern = String(path);
    reg_exp_pattern = reg_exp_pattern.replace(/\((\:?[\w]+)\)/g,function(){
      return '' + arguments[1] + '?'; //regex for optional params "/:one/:two/(:three)"
    });
    reg_exp_pattern = reg_exp_pattern.replace(/\:([\w]+)(\/?)/g,function(){
      params.push(arguments[1]);
      return '(([\\w]+)(/|$))';
    });
    reg_exp_pattern = reg_exp_pattern.replace(/\)\?\/\(/g,')?('); //cleanup for optional params 
    if(reg_exp_pattern.match(/\*/)){
      params.push('path');
      reg_exp_pattern = reg_exp_pattern.replace(/\*/g,'((.+$))?');
    }
    return [new RegExp('^' + reg_exp_pattern + '$'),params];
  };
  
  function generate_url(url,params){
    params = params || {};
    if(typeof(params) == 'string' && url.match(/\*/)){
      url = url.replace(/\*/,params).replace(/\/\//g,'/');
    }else{
      if(params.path){
        url = url.replace(/\*/,params.path.replace(/^\//,''));
      }
      var param_matcher = new RegExp('(\\()?\\:([\\w]+)(\\))?(/|$)','g');
      for(var param_name in params){
        if(param_name != 'path'){
          url = url.replace(param_matcher,function(){
            return arguments[2] == param_name
              ? params[param_name] + arguments[4]
              : (arguments[1] || '') + ':' + arguments[2] + (arguments[3] || '') + arguments[4]
            ;
          });
        }
      }
    }
    url = url.replace(/\([^\)]+\)/g,'');
    return url;
  };
  
  function set_address(path){
    if(enabled){
      if(current_route != path){
        $.address.value(path);
        current_route = path;
      }
    }
  };
  
  function external_change_handler(){
    if(enabled){
      var current_path = get();
      if(ready){
        if(current_path != current_route){
          set(current_path);
        }
      }
    }
  };
  
})(jQuery,this);