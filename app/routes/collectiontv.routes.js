module.exports = (app) => {
    const collection = require('../controllers/collectiontv.controller.js');
  
    // Lấy tất cả các thể loại
    app.get('/collectiontv/categories', collection.getAllCategory);

    // Lấy danh sách từng bộ phim trong môt thể loại trang home
    app.get('/collectiontv/list/the-loai/:keyCategories/:codeCategories', collection.getListAllMovie);

    // Lấy danh sách từng bộ phim trong môt thể loại
    app.get('/collectiontv/the-loai/:keyCategories/:codeCategories/:indexPage', collection.getAllMovieLimit);

    // Lấy số trang trong môt thể loại
    app.get('/collectiontv/page/the-loai/:keyCategories/:codeCategories', collection.getNumberPage);

    // Lấy những thể loại nổi bật trong môt thể loại
    app.get('/collectiontv/categories/the-loai/:keyCategories/:codeCategories', collection.getPrivateCategory);

    // Lấy thông tin của từng tập phim
    app.get('/collectiontvinformation/:keyCollection', collection.getInformationCollection);

    // Lấy từng tập trong 1 bộ phim có phân trang
    app.get('/collectiontv/series/:keyCollection', collection.getAllEpisodes);

    // Lấy thông tin của từng tập phim
    app.get('/collectiontvepisodes/:keyCollection/:index', collection.getAllEpisodesNotPaging);

    // Lấy từng tập trong 1 bộ phim phân trang
    app.get('/collectiontv/series/:keyCollection/:indexPage/:limit', collection.getAllEpisodesLimit);

    // Lấy link video
    app.post('/collectiontv/video', collection.getLinkVideo);

}