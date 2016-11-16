module.exports = (app, homeController) => {
	require('./express')(app, homeController);
	require('./auth')(app);
}