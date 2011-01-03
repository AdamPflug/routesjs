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
  require '../simpledoc/simpledoc'
  SimpleDoc.new('jquery.routes.js',
    :title => 'jQuery Routes',
    :target => 'docs/index.html',
    :namespace => '$.routes'
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