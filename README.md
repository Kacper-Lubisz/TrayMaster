# TrayMaster
[![GitHub Actions CI Badge](https://github.com/Kacper-Lubisz/TrayMaster/workflows/Node%20CI/badge.svg)](https://github.com/Kacper-Lubisz/TrayMaster/actions?query=workflow%3A%22Node+CI%22)

This program is a web-app for managing warehouse stock, specifically aimed at use in food stores.
It was originally written for [County Durham Foodbank](https://durham.foodbank.org.uk/) and the
[Trussell Trust](https://www.trusselltrust.org/).

It was designed to allow them to model their warehouse digitally, with the primary aim of assisting with the existing
workflows of foodstore staff by:
- Providing an efficient, flexible and intuitive stocktaking interface to maximise data collection speed
- Minimising food wastage by allowing the warehouse to be queried for trays expiring soon
- Allowing statistics and reports to be compiled from the data stored about the warehouse

It is also designed to be configurable and flexible enough to fit into other foodstore workflows if so desired.
In particular, a secondary goal was for the program to be able to be deployed in other Trussell Trust locations across
the UK.

## User Manual
This README contains only basic project information. The full project documentation (for users, administrators and developers)
can be found at [TODO add manual link].

## Installation & Usage
To install, clone this repository and run `npm install`.
We also offer prebuilt versions on the [Releases](https://github.com/Kacper-Lubisz/TrayMaster/releases) page.

The following commands are available:
- `npm start`: launch a local development copy of the application at `localhost:3000`
- `npm run build`: build the application for production deployment (outputs to the `build` directory)
- `npm test`: run all Jest test suites

### Hosting
The project, by default, is configured to run at `https://traymaster.herokuapp.com` and deploy automatically to Heroku
on all commits to the `master` branch. This is configured in `static.json`. There's also configuration in place for
Firebase static hosting (though certain routing features won't work on static hosts): this can be found in
`firebase.json`.

## Contributing
If you wish to contribute to this project, please fork this repository and make pull requests!

The project was developed using the JetBrains WebStorm IDE, and includes configuration files for both ESLint and
the built-in WebStorm code inspector.
We recommend that you use both if possible, though WebStorm does cost money for most non-students.
