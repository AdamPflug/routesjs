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
  require 'simpledoc'
  SimpleDoc.new('jquery.routes.js',
    :title => 'jQuery Routes',
    :target => 'docs/index.html',
    :namespace => '$.routes'
  )
end