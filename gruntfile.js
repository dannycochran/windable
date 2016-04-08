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
    },

    preprocess: {
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
          'components/**/*.scss',
          'vendor/*.css',
          'vendor/*.js'
        ],
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-copy');

  const build = ['browserify', 'preprocess:index', 'copy'];

  grunt.registerTask('app', build.concat(['concurrent:app']));
  grunt.registerTask('build', build);
};
