/**
 * Created by Ibrahim Ayman on 29/07/2017.
 */

exports = module.exports = function (app, mongoose) {
    var EventSchema = new mongoose.Schema({
        name: {type: String, default: '', required: true},
        description: {type: String, default: ''},
        date: {type: Date, default: Date.now},
        StartTime: {type: Date, default: Date.now},
        endTime: {type: Date, default: null},
        username: {type: String, required: true},
        search: [String]
    });
    EventSchema.plugin(require('./plugins/pagedFind'));
    EventSchema.index({name: 1});
    EventSchema.index({username: 1});
    EventSchema.index({date: 1});
    EventSchema.index({StartTime: 1});
    EventSchema.index({endTime: 1});
    EventSchema.index({search: 1});

    EventSchema.set('autoIndex', (app.get('env') === 'development'));
    app.db.model('Event', EventSchema);
};
