var last_params;
ViewWithRoutes = $.view(function(){
  return this.div();
},{
  article: function(params){
    this.lastParams = params;
  },
  articleComment: function(params){
    this.lastParams = params;
  },
  home: function(){

  },
  wiki: function(){},
  multipleParams: function(){},
  test: function(){},
  optionalOne: function(){},
  optionalTwo: function(){},
  optionalThree: function(){},
  extraParams: function(params){
    console.log('extraParams called with',params);
    last_params = params;
  }
});

Deep = {
  Nested: {
    TestView: $.view(function(){
      return this.div();
    },{
      test: function(){
        Deep.Nested.TestView.wasCalled = true;
      }
    })
  }
};

$.routes({
  '/': 'ViewWithRoutes#home',
  '/article/:id': 'ViewWithRoutes#article',
  '/article/:id/:comment_id': 'ViewWithRoutes#articleComment',
  '/wiki/*': 'ViewWithRoutes#wiki',
  '/one/two/:three/:four/:five/:six': ViewWithRoutes.instance().multipleParams,
  '/one/:a/(:b)': 'ViewWithRoutes#optionalOne',
  '/one/:a/(:b)/(:c)': 'ViewWithRoutes#optionalTwo',
  '/one/:a/(:b)/(:c)/(:d)/(:e)': 'ViewWithRoutes#optionalThree',
  '/:ViewWithRoutes/:method/:id': 'ViewWithRoutes#test',
  '/nested_test/': 'Deep.Nested.TestView#test',
  '/extra_params/:a': ['ViewWithRoutes#extraParams',{b:'b'}]
});

test('Url generation',function(){
  equal($.routes("url",'ViewWithRoutes#home'),'/');
  equal($.routes("url",'ViewWithRoutes#article',{id:'5'}),'/article/5');
  equal($.routes("url",'ViewWithRoutes#wiki','/one/two/three'),'/wiki/one/two/three');
  equal($.routes("url",'ViewWithRoutes#wiki',{path:'/one/two/three'}),'/wiki/one/two/three');
  equal($.routes("url",'ViewWithRoutes#test',{
    ViewWithRoutes: 'contacts',
    method: 'create',
    id: 5
  }),'/contacts/create/5');
});

test('Routes matching',function(){
  equal($.routes('match','/')[0],ViewWithRoutes.instance().home);
  equal($.routes('match','/article/5')[0],ViewWithRoutes.instance().article);
  equal($.routes('match','/article/5')[1].id,"5");
  equal($.routes('match','/one/two/3/4/5/6')[0],ViewWithRoutes.instance().multipleParams);
  equal($.routes('match','/one/two/3/4/5/6')[1].three,"3");
  equal($.routes('match','/one/two/3/4/5/6')[1].four,"4");
  equal($.routes('match','/one/two/3/4/5/6')[1].five,"5");
  equal($.routes('match','/one/two/3/4/5/6')[1].six,"6");

  equal($.routes('match','/one/a/b')[0],ViewWithRoutes.instance().optionalOne);
  equal($.routes('match','/one/a/b')[1].a,'a');
  equal($.routes('match','/one/a/b')[1].b,'b');

  equal($.routes('match','/one/a/b/c')[0],ViewWithRoutes.instance().optionalTwo);
  equal($.routes('match','/one/a/b/c')[1].a,'a');
  equal($.routes('match','/one/a/b/c')[1].b,'b');
  equal($.routes('match','/one/a/b/c')[1].c,'c');

  equal($.routes('match','/one/a/b/c/d/e')[0],ViewWithRoutes.instance().optionalThree);
  equal($.routes('match','/one/a/b/c/d/e')[1].a,'a');
  equal($.routes('match','/one/a/b/c/d/e')[1].b,'b');
  equal($.routes('match','/one/a/b/c/d/e')[1].c,'c');
  equal($.routes('match','/one/a/b/c/d/e')[1].d,'d');
  equal($.routes('match','/one/a/b/c/d/e')[1].e,'e');
  equal($.routes('match','/one/a/b/c/d')[0],ViewWithRoutes.instance().optionalThree);
  equal($.routes('match','/one/a/b/c/d')[1].a,'a');
  equal($.routes('match','/one/a/b/c/d')[1].b,'b');
  equal($.routes('match','/one/a/b/c/d')[1].c,'c');
  equal($.routes('match','/one/a/b/c/d')[1].d,'d');
});

test('Optional parameter url generation',function(){
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
    a: 'a',
    b: 'b'
  }),'/one/a/b');
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
    a: 'a'
  }),'/one/a/');
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
  
  }),'/one/:a/');
});

test('Nested objects can contain routable views',function(){
  $.routes("set",'/nested_test/');
  equal(Deep.Nested.TestView.wasCalled,true);
});

/*
test("Extra params are passed to method callback",function(){
  last_params = null;
  console.log('calling direct');
  ViewWithRoutes.instance().extraParams({
    a: 'a'
  });
  equal(last_params.a,'a');
  equal(last_params.b,'b');
  last_params = null;
  $.routes('set','/extra_params/a');
  equal(last_params.a,'a');
  equal(last_params.b,'b');
  last_params = null;
});

test("Extra params are passed to anon calback",function(){
  
});

*/

asyncTest('Method calling and dispatch modifies address',function(){
  setTimeout(function(){
    start();
    ViewWithRoutes.instance().home();
    ViewWithRoutes.instance().article({
      id: 5
    });
    equal($.routes('get'),$.routes('url','ViewWithRoutes#article',{id:'5'}));
    equal(ViewWithRoutes.instance().lastParams.id,5);
  },50);
});