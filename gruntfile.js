module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        options: {
          transform: [
            ['babelify', {presets: 'es2015'}],
            ['sassify', {'auto-inject': true}]
          ],
        },
        files: {
          './dist/windable.js': ['./components/build.js']
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
      index: {
        src: 'index.html',
        dest: 'dist/index.html'
      }
    },

    watch: {
      js: {
        files: [
          'components/build.js',
          'components/**/*.js',
          'components/build.scss',
          'components/**/*.scss'
        ],
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
      },

      others: {
        files: [
          'vendor/*.css',
          'vendor/*.js',
          'index.html'
        ],
        tasks: ['copy'],
        options: {
          livereload: true,
        },
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-copy');

  const build = ['browserify', 'copy'];

  grunt.registerTask('app', build.concat(['concurrent:app']));
  grunt.registerTask('rebuild', build);
};
