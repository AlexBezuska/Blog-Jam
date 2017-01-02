## Scrape game jam sites to auto generate blog posts

### by [Alex Bezuska](https://twitter.com/abezuska)

##### Project started: 2016.12.21

This is a tool intended to help #GameDev communities and Game Dev spaces like
ours [Warp Zone Louisville](http://warpzonelouisville.com) to show off the awesome games made by our community each time we participate in a game jam.


## How to use:

### Overview:
You provide it a list of game page urls and it will do all the work of pulling out title, author, screenshots, description and more creating an html file you can copy into your blog.
I have two included templates `ludumdare-bootstrap.html` if your blog has bootstrap and `ludumdare-minimal-styling.html` which includes some minimal css to get you started. Create your own by duplicating an existing template. This project uses [request](https://www.npmjs.com/package/request), and [cheerio](https://www.npmjs.com/package/cheerio) to scrape data from game jam websites (currently only ludumdare.com).

### Instructions:

* Install node (instructions for your OS here: https://nodejs.org/en/)
* Clone this repository or download the zip
* Open `index.js` in your text editor and replace the urls in the config object at the top with your own (currently only ludumdare.com urls work).
* Navigate to this project in your terminal
* Run the program using `node index.js`
* You will notice a file added to the `./output` directory called `blog-post.html` (or whatever you named in in config)
* Open the output html in your browser to make sure everything is working
* Copy html into your blog post (see note for WordPress users below if you are having strange formatting issues)

Note for WordPress users:
When copying html into a blog post WordPress loves to do things like insert `<br/>` tags and automatically put things in paragraphs, this can really jack up the formatting of the post. To address this I really recommend you use the plugin [Raw HTML by Janis Elsts](https://wordpress.org/plugins/raw-html/) It is free allows you to uncheck all of those settings for each post, example:
![Recommended WordPress Raw HTML settings](/tutorial/images/wp-raw-html.png?raw=true "Recommended WordPress Raw HTML settings")


## Contributing

Please do not hesitate to submit pull requests, I would love this to be a community effort, the Game Dev community is all about helping each-other out and I want to offer this tool as a starting point to build something greater.
Check the Github issues for ways to help that I already have on my radar, but here are a few important issues:
* The name sucks, I want it to be easy for people to understand what this does
* I would love help to add the capability to scrap other game jam sites to this project. Global Game Jam and Itch would be fantastic additions

## Versioning

I would like to use SemVer but I need to research how to do that a bit more.

## Authors

* **[Alex Bezuska](https://github.com/alexbezuska)** - *Initial work*

See also the list of [contributors](https://github.com/AlexBezuska/Ludum-Dare-entries-2-Blog/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.TXT](LICENSE.TXT) file for details

