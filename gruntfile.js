// order here determines dependency (must manually add all vendor JS here)

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        options: {
          transform: [
            ['babelify', {presets: 'es2015'}]
          ],
        },
        files: {
          './dist/build.js': ['./components/build.js']
        }
      }
    },

    copy: {
      vendor: {
        expand: true,
        cwd: 'vendor',
        src: '**',
        dest: 'dist/vendor'
      },
      data: {
        expand: true,
        cwd: 'data',
        src: '**',
        dest: 'dist/data'
      },
    },

    sass: {
      dist: {
        files: {
          'dist/build.css': 'components/build.scss'
        }
      }
    },

    preprocess: {
      index: {
        src: 'index.html',
        dest: 'dist/index.html'
      }
    },

    watch: {
      js: {
        files: ['components/**/*.js', 'components/build.js', 'vendor/*.js'],
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
      },
      css: {
        files: ['components/**/*.scss', 'vendor/*.css'],
        tasks: ['sass'],
      },
      html: {
        files: ['index.html'],
        tasks: ['preprocess:index'],
      }
    },

    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          nodeArgs: ['--debug'],
          ignoredFiles: ['node_modules/**'],
          watchExtensions: ['js']
        }
      },
    },

    concurrent: {
      app: {
        tasks: ['nodemon:dev', 'watch'],
        options: {logConcurrentOutput: true}
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-copy');

  const build = ['browserify', 'sass', 'preprocess:index', 'copy'];

  grunt.registerTask('app', build.concat(['concurrent:app']));
  grunt.registerTask('build', build);
};
