module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  //config
  grunt.initConfig({
    connect: {
      server: {
        options: {
          host: 'localhost',
          port: 9999,
          base: 'dist',
          open: {
            target: 'http://localhost:9999'
          }
        }
      }
    },

    concat: {
      app: {
        options: {
          process: function(src, path) {
            return '!(function(lodash){ "use strict";\r\n'+src+'\r\n}).call(this);';
          }
        },
        src: ['src/**/*.*'],
        dest: 'dist/fupslot.lodash.extend.js'
      }
    },

    uglify: {
      app: {
        src: ['./dist/fupslot.lodash.extend.js'],
        dest: './dist/fupslot.lodash.extend.min.js'
      }
    },

    watch: {
      css: {
        files: ['src/**/*.*'],
        tasks: ['concat'],
        options: {
          livereload: {
            port: 9001,
          }
        }
      }
    }
  });

  grunt.registerTask('default', ['connect:server','watch']);
  grunt.registerTask('package', ['concat:app','uglify:app']);
};