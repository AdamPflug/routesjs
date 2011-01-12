require 'rubygems'

HEADER = /((^\s*\/\/.*\n)+)/

desc "rebuild the jquery.routes.js files for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  source = File.read('lib/jquery.address.js') + File.read('jquery.routes.js')
  header = source.match(HEADER)
  File.open('jquery.routes.min.js', 'w+') do |file|
    file.write header[1].squeeze(' ') + Closure::Compiler.new.compress(source)
  end
end

task :docs do
  require 'Maruku'
  require '../markprocdoc/markprocdoc'
  MarkProcDoc.new('jquery.routes.js',
    :title => 'jQuery Routes',
    :target => 'docs/index.html',
    :namespace => '$.routes',
    :toc => nil,
    :html => Proc.new{|title,body,toc|
      <<-EOS
      <!DOCTYPE html>
      <html>
        <head>
          <title>#{title}</title>
          <link rel="stylesheet" media="screen" href="screen.css"/>
        </head>
        <body>
          #{body}
          <div id="toc">#{toc}</div>
          <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-20694546-2']);
            _gaq.push(['_trackPageview']);

            (function() {
              var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
              ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
              var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

          </script>
        </body>
      </html>
      EOS
    }
  )
  #write README
  source = File.read('jquery.routes.js')
  readme_lines = []
  lines = source.split("\n")
  lines.each_with_index do |line,i|
    if line.match /^\s+?\/?\*\s/
      break if(line.match(/^\s+?\/?\*\s\-\-\-/))
      readme_lines.push(line.gsub(/^\s+?\/?\*\s/,''))
    end
  end
  readme_lines.pop
  File.open("README.markdown",'w+') do |file|
    file.write readme_lines.join("\n")
  end
end