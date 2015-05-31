/*global module*/
module.exports = function (grunt) {
    'use strict';
    var gruntConfig = {};
    grunt.loadNpmTasks('grunt-contrib-jshint');
    gruntConfig.jshint = {
        options: { bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true, immed: true,
          indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, plusplus: false,
          quotmark: true, regexp: true, undef: true, unused: true, strict: true, trailing: true,
          maxparams: 3, maxdepth: 3, maxstatements: 50},
        all: [
            'Gruntfile.js',
            'src/**/*.js'
        ]
    };
    grunt.initConfig(gruntConfig);
    grunt.registerTask('travis', 'jshint');
};