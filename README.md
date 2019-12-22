# School project
Basic node.js app that uses express for routing, mongodb, mongoose for validation and handlebars for templates.

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
