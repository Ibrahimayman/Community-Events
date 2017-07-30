/**
 * Created by Ibrahim Ayman on 29/07/2017.
 */
'use strict';

// events
exports.find = function (req, res, next) {
    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.username) {
        filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
    }

    req.app.db.models.Event.pagedFind({ // you must include model in models.js file
        filters: filters,
        keys: 'name username description',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (req.xhr) {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            results.filters = req.query;
            res.send(results);
        }
        else {
            results.filters = req.query;
            res.render('events/index', {data: results.data});
        }
    });
};

// get event by Id.
exports.read = function (req, res, next) {
    req.app.db.models.Event
        .findById(req.params.id)
        .exec(function (err, event) {
            if (err) {
                return next(err);
            }

            if (req.xhr) {
                res.send(event);
            }
            else {
                res.render('events/details', {event: event});
            }
        });
};

// render add page.
exports.Add = function (req, res) {
    if (!req.isAuthenticated()) {
        req.flash('error', "you are not logged in");
        req.location('/events');
        req.redirect('/events')
    }
    res.render('events/add');
};

exports.create = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        if (!req.body.name) {
            workflow.outcome.errors.push('Please enter event name.');
            return workflow.emit('response');
        }

        workflow.emit('createEvent');
    });

    workflow.on('createEvent', function () {
        var fieldsToSet = {
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            StartTime: req.body.StartTime,
            endTime: req.body.endTime,
            username: req.user.username,
            search: [
                req.body.name
            ]
        };
        req.app.db.models.Event.create(fieldsToSet, function (err, event) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = event;
            req.flash('success', 'event created successfully');
            res.location("/events/");
            res.redirect("/events/");
        });
    });

    workflow.emit('validate');
};

// get event by Id for edit.
exports.edit = function (req, res, next) {
    req.app.db.models.Event
        .findById(req.params.id)
        .exec(function (err, event) {
            if (err) {
                return next(err);
            }

            if (req.xhr) {
                res.send(event);
            }
            else {
                res.render('events/edit', {event: event});
            }
        });
};

exports.update = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        if (!req.body.name) {
            workflow.outcome.errors.push('Please enter event name.');
            return workflow.emit('response');
        }

        workflow.emit('updateEvent');
    });

    workflow.on('updateEvent', function () {
        var fieldsToSet = {
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            StartTime: req.body.StartTime,
            endTime: req.body.endTime,
            username: req.user.username,
            search: [
                req.body.name
            ]
        };
        req.app.db.models.Event.findByIdAndUpdate(req.params.id, fieldsToSet, function (err, event) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = event;
            req.flash('success', 'event updated successfully');
            res.location("/events/show/" + req.params.id);
            res.redirect("/events/show/" + req.params.id);
        });
    });

    workflow.emit('validate');
};

exports.delete = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        workflow.emit('deleteEvent');
    });
    workflow.on('deleteEvent', function () {
        req.app.db.models.Event.findByIdAndRemove(req.params.id, function (err, event) {
            if (err) {
                return next(err);
            }
            res.flash('success', 'event deleted');
            res.location('/events');
            res.redirect('/events');
        });
    });
    workflow.emit('validate');
};
