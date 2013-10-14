/*global describe:true,beforeEach:true,afterEach:true,it:true*/

var ModelArray = require('modelarray'),
    chai = require('chai'),
    expect = chai.expect,
    compare, users, pg, pg2, mehdi, jeremy, thomas, emit;

/**
 * User model
 */

function User(id, name) {
  this.id = id;
  this.cid = 'c' + id;
  this.name = name;
}

User.prototype.compare = function (u1, u2) {
  if (u1.name < u2.name)  return -1;
  if (u1.name > u2.name)  return 1;
  return 0;
};

User.prototype.toString = function () {
  return this.name;
};

User.prototype.set = function (obj) {
  this.name = obj.name;
  for (var ppty in obj) this[ppty] = obj[ppty];
};

/**
 * Users collection
 */

function Users() {
  return ModelArray.apply(this, arguments);
}

/*!
 * Inherit ModelArray
 */

Users.prototype.__proto__ = ModelArray.prototype;
Users.prototype.model = User;

/*!
 * scenarios
 */

var scenarios = [
  {
    name: 'array of User',
    init: function () {
      compare = null;
      jeremy = new User(1, 'jeremy');
      mehdi = new User(2, 'mehdi');
      pg = new User(3, 'pg');
      thomas = new User(4, 'thomas');
      pg2 = new User(3, 'Pierre-Guillaume');
      users = new Users([pg, mehdi, jeremy]);
    }
  },
  {
    name: 'array of Object',
    init: function () {
      compare = function (o1, o2) {
        if (o1.name < o2.name) return -1;
        if (o1.name > o2.name) return 1;
        return 0;
      };
      jeremy = {id: 1, name: 'jeremy'};
      mehdi = {id: 2, name: 'mehdi'};
      pg = {id: 3, name: 'pg'};
      thomas = {id: 4, name: 'thomas'};
      pg2 = {id: 3, name: 'Pierre-Guillaume'};
      users = new ModelArray([pg, mehdi, jeremy]);
    }
  },
  {
    name: 'array of String',
    init: function () {
      compare = null;
      pg =  pg2 = 'pg';
      mehdi = 'mehdi';
      jeremy = 'jeremy';
      thomas = 'thomas';
      users = new ModelArray([pg, mehdi, jeremy]);
    }
  },
  {
    name: 'array of Integer',
    init: function () {
      pg = pg2 = 3;
      mehdi = 2;
      jeremy = 1;
      thomas = 4;
      users = new ModelArray([pg, mehdi, jeremy]);
    }
  }
];

scenarios.forEach(function (scenario) {

  describe(scenario.name, function () {

    beforeEach(function () {
      scenario.init();
      emit = 0;
    });

    afterEach(function () {
      users.off();
      users = null;
    });

    it('should behave like an array', function () {
      expect(users).to.be.an.instanceof(Array);
      expect(users).to.be.an.instanceof(ModelArray);
      expect(users).to.have.length(3);
      expect(Array.isArray(users)).to.be.ok;
    });

    it('should get', function () {
      expect(users.get(pg)).to.eq(pg);
      if (pg.id) expect(users.get(pg.id)).to.eq(pg);
      if (pg.id) expect(users.get({id: pg.id})).to.eq(pg);
      if (pg.cid) expect(users.get({cid: pg.cid})).to.eq(pg);
    });

    it('should remove', function () {
      users.on('remove', function (models) {
        expect(models).to.have.length(2);
        expect(models[0]).to.eq(pg);
        expect(models[1]).to.eq(mehdi);
        emit++;
      });
      users.remove(pg, mehdi, mehdi);

      expect(emit).to.eq(1);
      expect(users).to.have.length(1);
    });

    it('should set', function () {
      users
        .on('remove', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(mehdi);
          emit++;
        })
        .on('add', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
          emit++;
        })
        .set([pg2, thomas, jeremy, jeremy]);

      expect(users).to.have.length(3);
      expect(users.get(pg).name).to.eq(pg2.name);
      expect(emit).to.eq(2);
    });

    it('should reset', function () {
      users
        .on('reset', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
        })
        .reset([thomas]);
      expect(users).to.have.length(1);
    });

    it('should push', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).push(thomas, pg);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should pop', function () {
      users.on('remove', function (model) {
        expect(model).to.eq(jeremy);
        emit++;
      }).pop();
      expect(users).to.have.length(2);
      expect(emit).to.eq(1);
    });

    it('should splice', function () {
      users
        .on('remove', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(mehdi);
          emit++;
        })
        .on('add', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
          emit++;
        })
        .splice(1, 1, thomas, pg);
      expect(users).to.have.length(3);
      expect(emit).to.eq(2);
    });

    it('should unshift', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).unshift(thomas, pg);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should shift', function () {
      users.on('remove', function (model) {
        expect(model).to.eq(pg);
        emit++;
      }).shift();
      expect(users).to.have.length(2);
      expect(emit).to.eq(1);
    });

    it('should sort', function () {
      users.on('sort', function () {
        emit++;
      }).sort(compare);
      expect(users.slice()).to.deep.eq([jeremy, mehdi, pg]);
      expect(emit).to.eq(1);
    });
  });
});



