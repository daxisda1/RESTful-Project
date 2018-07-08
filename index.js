const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Sequelize = require('sequelize');

const app = express();
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false}));

const sequelize = new Sequelize('Dane', 'music', null, {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './chinook.sqlite',
    operatorsAliases: Sequelize.Op
});

const Op = Sequelize.Op

const Album = sequelize.define("Album", {
    AlbumId : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ArtistId: Sequelize.INTEGER,
    Title: Sequelize.STRING
},
{
    freezeTableName: true,
    timestamps: false,
}
);

const Artist = sequelize.define("Artist", {
    ArtistId : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: Sequelize.STRING
},
{
    freezeTableName: true,
    timestamps: false,
}
);

const Track = sequelize.define("Track", {
    TrackId : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: Sequelize.STRING,
    AlbumId: Sequelize.INTEGER,
    Milliseconds: Sequelize.INTEGER
    
},
{
    freezeTableName: true,
    timestamps: false,
}
);


app.get('/', (req, res) => {
    if( req.headers['music-request'] === 'album' ) {
        Album.findAll().then( albums => res.json(albums))
    }else{
        res.status(404).json({message: `Sorry the ${req.headers['music-request']} table does not exists in our database.`})
    }
});

app.post('/albums', (req, res) => {
    if( req.body['music-request'] === 'album-artist' ) {
        sequelize.query(`
        SELECT a.Title Album, ar.Name Artist
        FROM Album a
        JOIN Artist ar USING(ArtistId)
        LIMIT 100
        `, {model: Album, raw: true}).then( albums => res.json(albums))
    }else{
        res.status(404).json({message: `Sorry the ${req.body['music-request']} table does not exists in our database.`})
    }
});

app.post('/album/add', (req, res) => {
    Album.create({Title: req.body.Title, ArtistId: req.body.ArtistId})
        .then(album => res.json(album))
})







app.post('/tracks', (req, res) => {
    const trackLength = req.body['music-track-minutes'] * (60 * 1000) + req.body['music-track-seconds'] * 1000;
    Track.findAll({
        where: {
            Milliseconds: {
                [Op.gt]: trackLength
            }
        },
        limit: 100
    }).then( track => res.json(track))
});

app.listen(7777, () => console.log('Server running at http://localhost:3000'));