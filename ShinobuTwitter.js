var Twit = require('twit');
const booru = require('booru')
const GENRE = [
    "catgirl",
    "loli",
    "yuri"
]

var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    https = require('https'),
    Stream = require('stream').Transform,
    config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

function pick_random_cat_girl() {
    var kawaii = [
        'image.png'
    ];
    return kawaii[Math.floor(Math.random() * kawaii.length)];
}

function upload_random_image() {
    let choose = ~~(Math.random() * GENRE.length);
    var tag = GENRE[choose];
    console.log('Getting image link...')
    booru.search('kn', [`${tag}`, 's'], {
            limit: 1,
            random: true
        })
        .then(booru.commonfy)
        .then(images => {
            for (let image of images) {

                var url = `${image.common.file_url}`;

                https.request(url, function(response) {
                    var data = new Stream();

                    response.on('data', function(chunk) {
                        data.push(chunk);
                    });

                    response.on('end', function() {
                        fs.writeFileSync('image.png', data.read());
                    });
                }).end();
            }
        })
        .catch(err => {
            if (err.name === 'booruError') {
                console.log(err.message)
            } else {
                console.log(err)
            }
        })

    const stats = fs.statSync("image.png")
    const fileSizeInBytes = stats.size
    console.log(fileSizeInBytes)
    if (fileSizeInBytes > 3145728) {
        console.log("Image size is too big!")
        return false;
        upload_random_image()
    } else {
        var image_path = path.join(__dirname, pick_random_cat_girl()),
            b64content = fs.readFileSync(image_path, {
                encoding: 'base64'
            });

        T.post('media/upload', {
            media_data: b64content
        }, function(err, data, response) {
            if (err) {
                console.log('ERROR');
                console.log(err);
            } else {
                console.log('Uploaded an image!');

                T.post('statuses/update', {
                        media_ids: new Array(data.media_id_string)
                    },
                    function(err, data, response) {
                        if (err) {
                            console.log('Error!');
                            console.log(err);
                        } else {
                            console.log('Posted an image!');
                        }
                    }
                );
            }
        });
    }
}

setInterval(
    upload_random_image,
    1800000 //30 minutes
);
