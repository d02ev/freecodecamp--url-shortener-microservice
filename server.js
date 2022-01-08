require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const BodyParser = require('body-parser');
const DNS = require('dns');

// configuring body-parser for POST methods
app.use(BodyParser.urlencoded(
  {
    extended: false
  }
));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// array of object to map links with an ID
const URLs = [];

// ID variable to be mapped with
let id = 0;

// post request to create the shortened url
app.post('/api/shorturl', (req, res) => {
  const { url: _url } = req.body;

  if (_url === "") {
    return res.json(
      {
        "error": "invalid url"
      }
    );
  }

  let parsed_url;
  const modified_url = _url.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, '');

  try {
    parsed_url = new URL(_url);
  }
  catch (err) {
    return res.json(
      {
        "error": "invalid url"
      }
    );
  }

  DNS.lookup(modified_url, (err) => {
    if (err) {
      return res.json(
        {
          "error": "invalid url"
        }
      );
    }
    else {
      const link_exists = URLs.find(l => l.original_url === _url)

      if (link_exists) {
        return res.json(
          {
            "original_url": _url,
            "short_url": id
          }
        );
      }
      else {
        // increment for each new valid url
        ++id;

        // object creation for entry into url
        const url_object = {
          "original_url": _url,
          "short_url": `${id}`
        };

        // pushing each new entry into the array
        URLs.push(url_object);

        // return the new entry created
        return res.json(
          {
            "original_url": _url,
            "short_url": id
          }
        );
      }
    }
  });
});

// get request to navigate to the url
app.get('/api/shorturl/:id', (req, res) => {
  const { id: _id } = req.params;

  // finding if the id already exists
  const short_link = URLs.find(sl => sl.short_url === _id);

  if (short_link) {
    return res.redirect(short_link.original_url);
  }
  else {
    return res.json(
      {
        "error": "invalid URL"
      }
    );
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// app.listen(3000, () => {
//   console.log("Server Running....");
// });