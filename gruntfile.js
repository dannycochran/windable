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
          './dist/windable.js': ['./components/build.js']
        }
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/windable.min.js': ['dist/windable.js']
        }
      }
    },

    watch: {
      js: {
        files: [
          'components/build.js',
          'components/**/*.js'
        ],
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
      },
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  const build = ['browserify', 'uglify'];

  grunt.registerTask('app', build.concat(['concurrent:app']));
  grunt.registerTask('rebuild', build);
};
