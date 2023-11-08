### ArcGIS Tutorials

Lots of example of things that can done with ArcGIS: [Link](https://developers.arcgis.com/labs/browse/?product=arcgis-online&topic=any)

### ArcGIS Map Styles Editor

Same idea as what we do when styling Google Maps: [Link](https://developers.arcgis.com/vector-tile-style-editor/)

### ArcGIS Story Maps

This is what KTT folks use to create featured stories: [Link](https://storymaps.arcgis.com/)

## KTT Project

Keweenaw Time Travelers App

### Installing Yarn

https://yarnpkg.com/getting-started/install

- Install the Yarn global binary to its latest version: `npm install -g yarn`
- Move into your project folder
- Run the following: `yarn set version berry`
- Commit new & updated files

### Project Steps

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

- Step 1: setup react in a new folder called login`npx create-react-app login`
- Step 1.1: consider redux `npx create-react-app my-app --template redux` [Docs](https://react-redux.js.org/introduction/getting-started)
- STeo 1.2: redux dev tools [Yarn Install](https://yarnpkg.com/package/redux-devtools-extension)
- Step 2: `npm start` make sure things are working
- Step 3: `npm install --save react-router-dom`
- Step 4: in App.js wrap everything in the `<Router>` add `<Switch>`
- Step 5: create 'pages' and 'components' directories
- Step 6: import pages in App.js setup routes
- Step 7: setup CSS - [CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet) - [CSS Post Process](https://create-react-app.dev/docs/post-processing-css/)
- Step 8: setup FontAwesome - [Yarn Config](https://github.com/FortAwesome/Font-Awesome/issues/16156) - [Font Awesome Install](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers) - [Font Awesome React](https://fontawesome.com/how-to-use/on-the-web/using-with/react)
- Step 9: arcgis install - started sandbox using esri-loader but ArchGIS JS API 4.19 moved to using ES Modules (note style sheet now in index.html) - [ArcGIS Install](https://developers.arcgis.com/javascript/latest/es-modules/)

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
