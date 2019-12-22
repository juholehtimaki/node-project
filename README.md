# BWA/TIETA12 coursework assignment

In the assignment, we gamify multi-choice questionnaire.
The assignment consists of three parts: the game, management view, and testing/documentation.

1. game - some mechanism for selecting the right answers

2. management implies CRUD operations: questions can be created, queried, modified, and deleted.

3. test your modifications, that is game and management view in particular, other tests can be implemented as well.

In the beginning of December, we will meet all the groups to check that each
group has some idea how to proceed.
In addition, we promote MIT licensing:
if you grant the license, your game may be integrated in the LukioPlussa project;
the project is funded by the Ministry of Education. Its aim is to provide free learning material
for high-school students, especially for the domains of mathematics and computer science.

### The project structure

```
.
├── app.js                  --> express app
├── index.js                --> bwa app
├── package.json            --> app info and dependencies
├── controllers             --> controllers (handle e.g. routing)
│   ├── game.js             --> handle grading and game rendering
│   ├── questionnaire.js    --> handle questionnaire CRUD
│   ├── user.js             --> user action handling
│   └── hello.js            --> home page
├── models                  --> models that reflect the db schemes and take care of storing data
├── resources               --> statically served pics, sounds, gamescript
├── libraries               --> statically served external libraries
├── routes                  --> a dir for router modules
│   ├── hello.js            --> / (root) router
│   ├── game.js             --> routes for corresponding controller
│   ├── questionnaire       --> routes for corresponding controller
│   └── users.js            --> routes for corresponding controller
├── views                   --> views - visible parts
│   ├── error.hbs           --> error view
│   ├── hello.hbs           --> main view - "minimal viable grader"
│   ├── layouts             --> layouts - handlebar concept
│   │   └── layout.hbs      --> layout view, "template" to be rendered
│   ├── partials            --> smaller handlebar components to be included in views
│   ├── game                --> game views (grading, list available games, single game view)
│   └── management          --> management views
└── test                    --> tests
│   ├── assignment          --> our tests
│   ├── integration         --> integration tests
└── └── models              --> unit tests for models

```

## Game
For playing a questionnaire game, the user can view /games/ route to see a list of all available questionnaires. 
The listed questionnaries link to the respective /game/id route. The /game/id/ route fetches the questionnaire in the backend and renders a handlebars template
so that the questionnaire object is a local variable on the client and the gameScript.js in the template can access it.

gameScript uses p5.js, p5.play.js and p5.sound.js libraries to draw a game where you eat the correct answers playing as a fish.
Whenever a correct answer is eaten, the answer options corresponding mongodb _id is stored into an array. 
Once the game is complete, it sends the results to the grader as JSON where the object contains keys for each 
question in the questionnaire and under these keys is the corresponding array of answer options' ids selected for that question.
{
    "questionnaire._id": [answerOption._id, ...]
    ...
}
The grading backend then fetches the questionnaire and compares the answer list to the correct answers and responds with the A+ described response.

## Management view
Questionnaires are listed via route /questionnaires/. This route renders a view that lists all questionnaire titles and lets you expand them to view their contents.
Includes links to edit any questionnaire from the list.

Individual questionnaires are edited via the /questionnaires/id route. This renders an editing view where the current questionnaire is shown and buttons for adding
new options etc are available. When save button is clicked the whole questionnaire on the HTML is constructed into a JSON that is then POSTed to questionnaire/id route.

When creating a new questionnaire via /new/ route it shows the questionnaire editing view with a template questionnaire that has no _id attribute and does not exist in the database.
When saving a new questionnaire the same controller handles it as edited questionnaires, but because there is no _id attribute it will create a new questionnaire instead of updating exiting ones.

Questionnaires are deleted via a post request to /questionnaires/id that then removes the corresponding id from database.
Links to delete questionnaires are in the editing view.


## Tests and documentation
Automated tests are run after every commit and most crucial parts of the program are tested by unit tests. More test would be implemented in the future if new features are made.

Code is kept clean by SonarQube analysis which will inform about code-smells, bugs and vulnerabilities.

Most parts of the code is commented, so by reading the comments reader gets good insight of the methods. In addition this documentation will tell more about the program and it's structure,
installation and etc.


## Security concerns

*THREAT*
A known security issue with the game is that the clientside application has the questionnaire object including the correctness of the answers.
*DESCRIPTION*
If used for only practice and not actual exam applications this is a non-issue. It could matter if the points from the questionnaires actually had some value
in grading etc. where this would have to be secured properly.
This could be avoided by removing the correctness-field from the questionnaire object given to the game client but then to play correct sound and visual feedback
in-game that relies on the correctness of the answer, a query would have to be done to the server for each answer to ask whether or not it was a correct one.

Project work uses Helmet and CSURF as protection from possible security threats.

---

## Installation

1. Install `nodejs` and `npm`, if not already installed.

2. Execute in the root, in the same place, where _package.json_-file is):

    ```
    npm install
    ```

3. **Copy** `.env.dist` in the root with the name `.env` (note the dot in the beginning of the file)

    ```
    cp -i .env.dist .env
    ```

    **Obs: If `.env`-file already exists, do not overwrite it!**

    **Note: Do not save `.env` file to the git repository - it contains sensitive data!**

    **Note: Do not modify `.env.dist` file. It is a model to be copied as .env, it neither must not contain any sensitive data!**

    Modify `.env` file and set the needed environment variables.

    In the real production environment, passwords need to be
    long and complex. Actually, after setting them, one does
    not need to memorize them or type them manually.

4. `Vagrantfile` is provided. It defines how the vagrant
   environment is set up, commands to be run:

    `vagrant up` //sets up the environment
    `vagrant ssh` //moves a user inside vagrant

    Inside vagrant, go to the directory `/bwa` and start the app:
    `npm start`

5. As an other alternative, `Dockerfile` is provided as well.
   Then, docker and docker-compile must be installed.
   In the root, give:

    ```
    docker-compose build && docker-compose up
    ```

    or

    ```
    docker-compose up --build
    ```

    The build phase should be needed only once. Later on you should omit the build phase and simply run:

    ```
    docker-compose up
    ```

    The container is started in the terminal and you can read what is written to console.log. The container is stopped with `Ctrl + C`.


    Sometimes, if you need to rebuild the whole docker container from the very beginning,
    it can be done with the following command:

    ```
    docker-compose build --no-cache --force-rm && docker-compose up
    ```

6. Docker container starts _bwa_ server and listens `http://localhost:3000/`

7) Docker container is stopped in the root dir with a command:

    ```
    docker-compose down
    ```

## Coding conventions

Project uses _express_ web app framework (https://expressjs.com/).
The application starts from `index.js` that in turn calls other modules.  
The actual _express_ application is created and configured in `app.js` and
routes in `router.js`.

The application complies with the _MVC_ model, where each route has
a corresponding _controller_ in the dir of `controllers`.
Controllers, in turn, use the models for getting and storing data.
The models centralize the operations of e.g. validation, sanitation
and storing of data (i.e., _business logic_) to one location.
Having such a structure also enables more standard testing.

As a _view_ component, the app uses _express-handlebars_;
actual views are put in the dir named `views`. It has two subdirectories:
`layouts` and `partials`.
`layouts` are whole pages, whereas `partials` are reusable smaller
snippets put in the `layouts` or other views. Views, layouts, and partials
use _handlebars_ syntax, and their extension is `.hbs`.
More information about _handlebars_ syntax can be found in: http://handlebarsjs.com/

Files such as images, _CSS_ styles, and clientside JavaScripts are under the `public` directory. When the app is run in a browser, the files are located under the`/`path, at the root of the server, so the views must refer to them using the absolute path. (For example, `<link rel =" stylesheet "href =" / css / style.css ">`) ** Note that `public` is not part of this path. **

The _mocha_ and _chai_ modules are used for testing and the tests can be found under the `test` directory.

##About coding policies

The project code aims to follow a consistent coding conventions
ensured by using the _eslint_ code validation tool. The primary purpose of the tool is to ensure that the project code follows more or less the generally accepted style of appropriate conventions, and that the code avoids known vulnerabilities and / or risky coding practices. In addition, the tool aims to standardize the appearance of code of all programmers involved in the project so that all code is easy to read and maintainable for non-original coders as well.

English is recommended for naming functions and variables and commenting on code. Git commit messages should also be written in English, but this is neither required nor monitored.

##Code style

The _eslint_ tool used is configured to require certain stylistic considerations that can reasonably be considered as opinion issues and may not necessarily be true or false. The intention is not to initiate any debate on the subject or upset anyone's mind, but to strive for uniformity in the appearance of the code, with no other motives.

This project follows the following coding styles:

-   indents with 4 spaces
-   the code block starting bracket `{` is in the same line as the block starting the function, clause or loop
-   the block terminating bracket `}` in the code block is always on its own line, except in cases where the whole block is on a single line
-   the _camelCase_ style is recommended for naming functions and variables
-   the variables should not be defined by using the `var` keyword, but the variables and constants are defined using the`let` and `const` keywords
-   each line of code ends with a semicolon `;`

You can check the style of your code by command:

`` ` npm run lint `` `

_eslint_ can also correct some code errors and style violations automatically, but you shouldn't rely on this blindly. You can do this explicitly with the command:

`` ` npm run lint:fix `` `

Naturally, it is easier to set up a code editor to monitor and correct the style during coding.

The project root directory contains the VSCode Editor configuration folder, where the appropriate settings are available for the editor. In addition, it contains plugin recommendations that VSCode will offer to install if the user so wishes. In addition, the project includes the _.editorconfig_ file, which allows you to easily import some of your settings to a number of other editors.
