/*global module*/
module.exports = function (grunt) {
    'use strict';
    var gruntConfig = {};
    grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
    gruntConfig.jshint = {
        options: { bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true, immed: true, asi: true, lastsemic: true, globalstrict: true,
          indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, plusplus: false,
          quotmark: true, regexp: true, undef: true, unused: false, strict: false, trailing: true, node: true,
          maxparams: 5, maxdepth: 4, maxstatements: 70},
        all: [
            'Gruntfile.js',
            'src/**/*.js'
        ]
    };
    grunt.initConfig(gruntConfig);
    grunt.registerTask('test', 'qunit:src');
    grunt.registerTask('travis', ['jshint', 'test']);
    gruntConfig.qunit = {
        src: ['tests/testArray.html','tests/testNeuron.html','tests/testLayer.html']
    };
};