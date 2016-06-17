//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Copyright (C) 2015-2016 Quildreen Motta.
// Licensed under the MIT licence.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const { property, forall} = require('jsverify');
const _ = require('../').data.validation;

describe('Data.Validation', function() {

  describe('constructors', function () {
    property('fromNullable#Failure', function() {
        return _.fromNullable(null).equals(_.Failure(null))
    });

    property('fromNullable#Success', 'json', function(a) {
        return _.fromNullable(a).equals(_.Success(a))
    }); 
  });

  describe('Functor', function () {
    property('map', 'json', 'json -> json', function(a, f) {
      return _.of(f(a)).equals(_.of(a).map(f))
    });
    
    property('Failure#map', 'json', 'json -> json', function(a, f) {
      return _.Failure(a).map(f).equals(_.Failure(a))
    });
  });

  describe('Applicative', function () {

    property('of', 'json', 'json', function(a, b) {
      return (a === b) === (_.of(a).equals(_.of(b)))
    });
    property('Success#ap', 'string', 'string', 'string -> string -> string', function(a, b, f) {
      debugger
      return _.Success(f)
                .ap(_.Success(a))
                .ap(_.Success(b))
                .equals(_.Success(f(a)(b)))
    });
    property('Success/Failure#ap', 'string', 'string','string -> string -> string', function(a, b, f) {
      return _.Success((a) => (b) => f(a,b))
                .ap(_.Success(a))
                .ap(_.Failure(b))
                .equals(_.Failure(b))
    });
    property('Failure#ap', 'string', 'string','string -> string -> string', function(a, b, f) {
      return _.Success((a) => (b) => f(a,b))
                .ap(_.Failure(a))
                .ap(_.Failure(b))
                .equals(_.Failure(a.concat(b)))
    });
  });

  describe('extracting/recovering', function () {
    property('Failure#getOrElse', 'json', 'json', function(a, b) {
      return _.Failure(b).getOrElse(a) === a
    });
    property('Success#getOrElse', 'json', 'json', function(a, b) {
      return _.Success(b).getOrElse(a) === b
    });

    property('Failure#orElse', 'json', 'json', function(a, b) {
      return _.Failure(b).orElse(() => a) === a
    });
    property('Success#orElse', 'json', 'json', function(a, b) {
      return _.Success(b).orElse(() => b).equals(_.Success(b))
    });
  });
  describe('folds', function () {
    const id = (a) => a
    property('Failure#fold', 'json', 'json -> json', function(a, f) {
      return _.Success(a).fold(f, id) === f(a)
    });
    property('Success#fold', 'json', 'json -> json', function(a, f) {
      return _.Failure(a).fold(id, f) === f(a)
    });

    property('Failure#merge', 'json', function(a) {
      return _.Success(a).merge() === a 
    });
    property('Success#merge', 'json', function(a) {
      return _.Failure(a).merge() === a 
    });

    property('Failure#swap', 'json', function(a) {
      return _.Failure(a).swap().equals(_.Success(a))
    });
    property('Success#swap', 'json', function(a) {
      return _.Success(a).swap().equals(_.Failure(a))
    });

    property('Success#bimap', 'json', 'json -> json', function(a, f) {
      return _.Success(a).bimap(f, id).equals(_.Success(f(a)))
    });
    property('Failure#bimap', 'json', 'json -> json', function(a, f) {
      return _.Failure(a).bimap(id, f).equals(_.Failure(f(a)))
    });

    property('Failure#failureMap', 'json', 'json -> json', function(a, f) {
      return _.Failure(f(a)).equals(_.Failure(a).failureMap(f))
    });
    
    property('Success#failureMap', 'json', 'json -> json', function(a, f) {
      return _.Success(a).failureMap(f).equals(_.Success(a))
    });
  });
});