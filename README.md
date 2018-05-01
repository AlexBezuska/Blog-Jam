## Community Game Jam Blogpost Generator
Works with `ludumdare.com` and `ldjam.com`!

### by [Alex Bezuska](https://twitter.com/abezuska)

##### Project started: 2016.12.21

This is a tool intended to help #gamedev communities and game dev spaces like ours ([Warp Zone Louisville](http://warpzonelouisville.com)) to easily show off the awesome games made by our community each time we participate in a game jam. The tool takes a provided list of game page urls and pulls out the title, author, screenshots, and description, and creates an html file that can be copied into a blog.

Example of finished output html (using the provided `bootstrap.html` template):

![](/tutorial/images/example.png)

View the actual blog post made with this utility here: [LD37 at Warp Zone Louisville](http://louisvillemakesgames.org/2017/01/01/our-ludum-dare-37-games/)

## How to use:

### Overview:
 Included templates `bootstrap.html` (if your blog has bootstrap) and `minimal-styling.html` or `raw.html` (which includes some minimal css) to get you started. Create your own by duplicating an existing template.

*new*

New template type for *Ludum Dare Ratings graphs* has been added, try it out by choosing the `ratings.html` template!
![](/tutorial/images/ratings.png)

This project uses [request](https://www.npmjs.com/package/request), and [cheerio](https://www.npmjs.com/package/cheerio) to scrape data from game jam websites (currently only ludumdare.com).

### Instructions:

* Install node (instructions for your OS here: https://nodejs.org/en/)
* Clone this repository or download the zip
* Duplicate `config.sample.json` and name it `config.json`
* Open `config.json` in your text editor and replace the `"jamURL"` and game `"urls"` your own (currently only ludumdare.com urls work). (see `config.json` help below for help)
* Navigate to this project in your terminal
* Run the program using `node index.js`
* You will notice a file added to the `./output` directory called `blog-post.html` (or whatever you named the `outputFile` in config)
* Open the output html in your browser to make sure everything is working
* Copy html into your blog post (see note for WordPress users below if you are having strange formatting issues)

**Note for WordPress users:**
When copying html into a blog post, WordPress loves to do things like insert `<br/>` tags and automatically put things in paragraphs, this can really jack up the formatting of the post. To address this I really recommend you use the free plugin [Raw HTML by Janis Elsts](https://wordpress.org/plugins/raw-html/) which allows you to check boxes to disable all of those settings for each post, example:

![](/tutorial/images/wp-raw-html.png)


### `config.json` help

* **"jamUrl"** - (string) - Necessary for ratings template, pulls in total number of participants, example: `"http://ludumdare.com/compo/ludum-dare-37/"`

* **"urls"** - (array of strings) - Currently this program only works with ludumdare.com game pages, mix and match jams if you like! Example: `"http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=34387"` (Don't mix multiple jams with the ratings it won't work!)

* **"ordering"** - (string)
    * `"default"` - Games will be presented in order of the urls in the array
    * `"alpha"` - Games will be in alphabetical order by title

* **"template"** - (string) - Current blog options: `"./templates/bootstrap.html"`, `"./templates/minimal-styling.html"`, `"./templates/raw.html"`
  And a *new ratings graph for ldjam:* `"./templates/ratings.html"`

* **"outputFile"** - (string) - example: "./output/blog-post.html"



## Contributing

Please do not hesitate to submit pull requests, I would love this to be a community effort. The game dev community is all about helping each other out and I want to offer this tool as a starting point to build something greater.
Check the Github issues for ways to help that I already have on my radar, but here are a few important issues:
* I would love help to add the capability to scrape other game jam sites to this project – Global Game Jam and Itch would be fantastic additions

## Versioning

SemVer, see `CHANGELOG.md`.

## Authors

* **[Alex Bezuska](https://github.com/alexbezuska)** - *Initial work*
* Shout out to [Barry Rowe](https://github.com/Barryrowe) for a lot of in-person help on the project

See also the list of [contributors](https://github.com/AlexBezuska/Ludum-Dare-entries-2-Blog/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.TXT](LICENSE.TXT) file for details
