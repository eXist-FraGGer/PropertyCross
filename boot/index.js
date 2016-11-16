module.exports = (app, homeController) => {
	require('./express')(app);
	require('./passport')(homeController);
}