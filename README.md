# TrayMaster
[![GitHub Actions CI Badge](https://github.com/Kacper-Lubisz/TrayMaster/workflows/Node%20CI/badge.svg)](https://github.com/Kacper-Lubisz/TrayMaster/actions?query=workflow%3A%22Node+CI%22)

This program is a web-app for managing warehouse stock, specifically aimed at use in food stores.
It was originally written as part of a coursework project for [County Durham Foodbank](https://durham.foodbank.org.uk/)
and the [Trussell Trust](https://www.trusselltrust.org/) by the following team of
[Durham University](https://dur.ac.uk) students:
- [Kacper Lubisz](https://github.com/Kacper-Lubisz)
- [Barnaby Collins](https://github.com/barnstorm3r)
- [Max Grimmett](https://github.com/grimm004)
- [Will Guerin-Ciccone](https://github.com/willg-c)
- [Matilda Wellander](https://github.com/mwellander)

## Installation & Usage
To install, clone this repository and run `npm install`.
We also offer prebuilt versions on the [Releases](https://github.com/Kacper-Lubisz/TrayMaster/releases) page.
You may wish to set up your own Firebase Cloud Firestore and specify the relevant information in the `.env` file.

The following commands are available:
- `npm start`: launch a local copy of the application at `localhost:3000`
- `npm run build`: build the application for production deployment (outputs to the `build` directory)
- `npm test`: run all Jest test suites

The project was developed using JetBrains WebStorm, and includes configuration files for both ESLint and WebStorm code
inspectors.

## Hosting
The project, by default, is configured to run at `https://traymaster.herokuapp.com` and deploy automatically to Heroku
on all commits to the `master` branch. This is configured in `static.json`. There's also configuration in place for
Firebase static hosting (though certain routing features won't work on static hosts): this can be found in
`firebase.json`.

## Contributing
If you wish to contribute to this project, please fork this repository and make Pull requests!
