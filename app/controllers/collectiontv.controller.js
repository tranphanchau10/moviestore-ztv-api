const moment = require('moment');
const axios = require('axios');
const delay = require('delay');
const jsdom = require("jsdom");
const vm = require('vm');

const { JSDOM } = jsdom;

exports.getAllCategory = async(req, res) => {
    let response = await axios.get('https://tv.zing.vn/')
    let data = await response.data
    if(data){
        let categories = getAllCategory(data)
        res.send(categories)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getInformationCollection = async(req, res) => {
    let keyCollection = req.params.keyCollection
    let response = await axios.get(`https://tv.zing.vn/${keyCollection}`)
    let data = await response.data
    if(data){
        let information = await getInformationCollection(data)
        res.send(information)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getPrivateCategory = async(req, res) => {
    let keyCategories = req.params.keyCategories
    let codeCategories = req.params.codeCategories
    let response = await axios.get(`https://tv.zing.vn/the-loai/${keyCategories}/${codeCategories}.html`)
    let data = await response.data
    if(data){   
        let categories = getPrivateCategory(data)
        res.send(categories)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getNumberPage = async(req, res) => {
    let keyCategories = req.params.keyCategories
    let codeCategories = req.params.codeCategories
    let response = await axios.get(`https://tv.zing.vn/the-loai/${keyCategories}/${codeCategories}.html`)
    let data = await response.data
    if(data){   
        let numberPage = getNumberPage(data)
        res.send(numberPage)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getAllMovieLimit = async(req, res) => {
    let keyCategories = req.params.keyCategories
    let codeCategories = req.params.codeCategories
    let indexPage = Number(req.params.indexPage)
    let response = await axios.get(`https://tv.zing.vn/the-loai/${keyCategories}/${codeCategories}.html?&page=${indexPage}`)
    let data = await response.data
    if(data){   
        let movies = await getAllMovie(data)
        res.send(movies)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getListAllMovie = async(req, res) => {
    let keyCategories = req.params.keyCategories
    let codeCategories = req.params.codeCategories
    let response = await axios.get(`https://tv.zing.vn/the-loai/${keyCategories}/${codeCategories}.html`)
    let data = await response.data
    if(data){   
        let movies = getListAllMovie(data)
        res.send(movies)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getAllEpisodes = async(req, res) => {
    let keyCollection = req.params.keyCollection
    let response = await axios.get(`https://tv.zing.vn/series/${keyCollection}`)
    let data = await response.data
    if(data){   
        let page = await getNumberPage(data)
        let episodes = await getAllEpisodes(data, page[0].page, keyCollection)
        episodes = episodes.reverse()
        res.send(episodes)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getAllEpisodesLimit = async(req, res) => {
    let keyCollection = req.params.keyCollection
    let limit = Number(req.params.limit)
    let indexPage = (Number(req.params.indexPage)-1)*limit
    let response = await axios.get(`https://tv.zing.vn/series/${keyCollection}`)
    let data = await response.data
    if(data){   
        let page = await getNumberPage(data)
        let episodes = await getAllEpisodes(data, page[0].page, keyCollection)
        episodes = episodes.reverse()
        episodes = episodes.slice(indexPage, indexPage+limit)
        res.send(episodes)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getLinkVideo = async(req, res) => {
    let url = req.body.url
    let response = await axios.get(url)
    let data = await response.data
    if(data){   
        let links = getLinkVideo(data)
        res.send(links)
    }else{
        res.send({ message: "lỗi" })
    }
}

exports.getAllEpisodesNotPaging = async(req, res) => {
    let keyCollection = req.params.keyCollection
    let index = req.params.index
    let response = await axios.get(`https://tv.zing.vn/${keyCollection}`)
    let data = await response.data
    if(data){
        let episodes = getAllEpisodesNotPaging(data, index)
        episodes = episodes.reverse()
        res.send(episodes)
    }else{
        res.send({ message: "lỗi" })
    }
}

function getAllEpisodesNotPaging(data, index){
    let items = []
    const dom = new JSDOM(data)
    let divClassInnerSectionPage = dom.window.document.getElementsByClassName('inner-section _page')[index]
    let divClassItemCurP = divClassInnerSectionPage.getElementsByClassName('item  cur-p')

    for(let i=0; i<divClassItemCurP.length; i++){
        let img = divClassItemCurP[i].getElementsByTagName('img')[0].getAttribute('src').trim()
        let key = divClassItemCurP[i].getElementsByTagName('a')[0].getAttribute('href').trim()
        let title = divClassItemCurP[i].getElementsByClassName('title')[0].textContent.trim()
        let timeASet = divClassItemCurP[i].getElementsByClassName('info-video')[0].textContent.trim()

        items.push({
            link: key,
            title: title,
            timeASet: timeASet,
            img: img,
            episodes: ""
        })
    }

    return items
}

function getLinkVideo(data){
    let links = []
    const dom = new JSDOM(data)
    let tagScripts = dom.window.document.scripts[23].innerHTML
    let indexbd = tagScripts.lastIndexOf("sourceLevel")
    indexbd = tagScripts.indexOf("[", indexbd)
    let indexkt = tagScripts.indexOf("]", indexbd)
    let sourceLevel = tagScripts.substring(indexbd, indexkt+1)

    do{
        indexbd = sourceLevel.indexOf("{")
        indexkt = sourceLevel.indexOf("}")+1
        let link = sourceLevel.substring(indexbd, indexkt)
        sourceLevel = sourceLevel.substring(indexkt)
        links.push({link})
    }while(sourceLevel.indexOf("{") !== -1)

    let newLink = []
    for(let i=0; i<links.length; i++){
        if(links[i].link.indexOf("\"") !== -1){
            indexbd = links[i].link.indexOf("\"")
            indexkt = links[i].link.indexOf("\"", indexbd+1)
            newLink.push({link: links[i].link.substring(indexbd+1, indexkt)})
        }
    }
    return newLink
}

async function getAllEpisodes(data, page, keyCollection){
    let dataCopy = data
    let items = []
    let i = 1
    do{
        const dom = new JSDOM(dataCopy)
        let divClassVideoItem = dom.window.document.getElementsByClassName('subtray block-item video-item')[0]
        if(divClassVideoItem !== undefined){
            let listItem = divClassVideoItem.getElementsByClassName('item')
            for(let j=0; j<listItem.length; j++){
                let img = listItem[j].getElementsByTagName('img')[0].getAttribute('src')
                
                // lấy thông tin từng tập phim
                let divClassBoxDescription = listItem[j].getElementsByClassName('box-description')[0]
                let name = divClassBoxDescription.getElementsByTagName('a')[0].textContent.trim()
                let key = divClassBoxDescription.getElementsByTagName('a')[0].getAttribute('href')
                let episodes = divClassBoxDescription.getElementsByTagName('meta')[0].getAttribute('content')

                // lấy tiêu đề, thời gian
                let divClassInfoDetail = divClassBoxDescription.getElementsByClassName('info-detail')[0].children
                let title = divClassInfoDetail[0] ? divClassInfoDetail[0].textContent.trim() : ""
                let timeASet = divClassInfoDetail[2] ? divClassInfoDetail[2].textContent.trim() : ""
                
                items.push({
                    link: key,
                    episodes: episodes,
                    title: title,
                    timeASet: timeASet,
                    img: img
                })
            }
        }
        i++
        let response = await axios.get(`https://tv.zing.vn/series/${keyCollection}?&page=${i}`)
        dataCopy = await response.data
    }while(i <= page)
    return items
}

async function getInformationCollection(data){
    let information = []
    const dom = new JSDOM(data)

    let divClassOutsideDes = dom.window.document.getElementsByClassName('outside-des')[0]
    if(divClassOutsideDes !== undefined){
        // lấy thông tin hình ảnh của phim
        let img = divClassOutsideDes.getElementsByTagName('img')[0].getAttribute('src')

        // lấy thông tin của phim
        let divClassBoxDescription = dom.window.document.getElementsByClassName('box-description')[0]
        let title = divClassBoxDescription.getElementsByTagName('h1')[0].textContent.trim()

        let length = divClassBoxDescription.getElementsByClassName('tag').length
        let tag = []
        let categories = []
        if(length === 2){
            // lấy thông tin trong class tag
            let divClassTag = divClassBoxDescription.getElementsByClassName('tag')[0]
            tag = getItemsTag(divClassTag)

            // lấy thông tin thể loại
            let divClassCategories = divClassBoxDescription.getElementsByClassName('tag')[1]
            categories = getItemsTagCategories(divClassCategories)
        }else if(length === 1){
            // lấy thông tin thể loại
            let divClassCategories = divClassBoxDescription.getElementsByClassName('tag')[0]
            categories = getItemsTagCategories(divClassCategories)
        }

        let description = divClassBoxDescription.getElementsByClassName('rows2')[0].textContent.trim()

        // lấy thông tin see all
        let episodesAll = ""
        if(dom.window.document.getElementsByClassName('title-bar group')[0].getElementsByTagName('a')[0] !== undefined){
            let lengthEpisodes = dom.window.document.getElementsByClassName('title-bar group')[0].getElementsByTagName('a').length
            episodesAll = dom.window.document.getElementsByClassName('title-bar group')[0].getElementsByTagName('a')[lengthEpisodes-1].getAttribute('href')
            episodesAll = episodesAll.substring(1)
        }

        // lấy thông tin quốc gia và thời lượng ( nếu có )
        let divClassBoxStatistics = dom.window.document.getElementsByClassName('box-statistics')[0].getElementsByTagName('li')
        let country = divClassBoxStatistics[0].textContent.trim()
        let indexbd = country.indexOf(':')
        country = country.substring(indexbd+2)  
        let timeASet = divClassBoxStatistics[1] ? divClassBoxStatistics[1].textContent.trim() : ""

        information.push({
            img: img,
            title: title,
            tag: tag,
            categories: categories,
            description: description,
            episodesAll: episodesAll,
            country: country,
            timeASet: timeASet
        })
    }

    return information
}

function getItemsTag(data){
    let items = []
    let listH3 = data.getElementsByTagName('h3')
    for(let i=0; i<listH3.length; i++){
        let title = listH3[i].textContent.trim()
        items.push({ title: title })
    }
    return items
}

function getItemsTagCategories(data){
    let items = []
    let listA = data.getElementsByTagName('a')
    for(let i=0; i<listA.length; i++){
        let title = listA[i].textContent.trim()
        let key = listA[i].getAttribute('href')
        key = subStringKeyCategories(key)
        items.push({ 
            title: title,
            key: key
        })
    }
    return items
}

async function getAllMovie(data){
    let dataCopy = data
    let movies = []

    const dom = new JSDOM(dataCopy)
    let divClassProgramItem = dom.window.document.getElementsByClassName('subtray block-item program-item')[0].children
    for(let i=0; i<divClassProgramItem.length; i++){
        let img = divClassProgramItem[i].getElementsByTagName('img')[0].getAttribute('src')
        
        // lấy thông tin phim
        let divBoxDesciption = divClassProgramItem[i].getElementsByClassName('box-description')[0]
        let title = divBoxDesciption.getElementsByTagName('a')[0].textContent.trim()
        let key = divBoxDesciption.getElementsByTagName('a')[0].getAttribute('href')
        key = key.substring(1)
        let description = divClassProgramItem[i].getElementsByTagName('h3')[0].textContent.trim()

        movies.push({
            img: img,
            title: title,
            key: key,
            description: description,
        })
    }
    return movies
}

async function getAllEpisodesOfMovie(key){
    let episodes = []
    let indexbd = key.lastIndexOf('/')
    let keyCollection = key.substring(indexbd+1)
    if(key !== "" && key.lastIndexOf('html') === -1){
        console.log(key)
        let response = await axios.get(`https://tv.zing.vn/${key}`)
        let data = await response.data
        let page = await getNumberPage(data)
        episodes = await getAllEpisodes(data, page[0].page, keyCollection)
        episodes = episodes.reverse()
    }else if(key === ""){

    }
    return episodes
}

function getListAllMovie(data){
    let movies = []
    const dom = new JSDOM(data)
    let divClassSectionRow = dom.window.document.getElementsByClassName('section row272')
    for(let i=0; i<divClassSectionRow.length; i++){
        let title = divClassSectionRow[i].getElementsByClassName('title-bar group')[0].textContent.trim()

        let divClassItems = divClassSectionRow[i].getElementsByClassName('item')
        let items = getItemsListAllMovie(divClassItems)
        
        movies.push({
            title: title,
            items: items
        })
    }

    return movies
}

function getItemsListAllMovie(data){
    let items = []
    for(let i=0; i<data.length; i++){
        let img = data[i].getElementsByClassName('_slideimg')[0].getAttribute('src')
        let key = data[i].getElementsByTagName('a')[0].getAttribute('href')
        key = subStringKeyCategories(key)
        let title = data[i].getElementsByClassName('title')[0].textContent.trim()
        let episodes = data[i].getElementsByClassName('subtitle')[0].textContent.trim()

        items.push({
            img: img,
            key: key,
            title: title,
            episodes: episodes
        })
    }
    return items
}

function getNumberPage(data){
    let numberPage = []
    const dom = new JSDOM(data)
    let ulClassPagination = dom.window.document.getElementsByClassName('pagination')[0]
    
    if(ulClassPagination){
        ulClassPagination = ulClassPagination.children
        let href = ulClassPagination[ulClassPagination.length-1].getElementsByTagName('a')[0].getAttribute('href')
        let indexbd = href.lastIndexOf("=")
        let page = Number(href.substring(indexbd+1))
        
        numberPage.push({ page: page })
    }else{
        numberPage.push({ page: 1 })
    }
    return numberPage
}

function getPrivateCategory(data){
    let categories = []
    const dom = new JSDOM(data)
    let divClassWideItem = dom.window.document.getElementsByClassName('c-list-item wide-item')[0]
    let tagA = divClassWideItem.getElementsByTagName('a')
    for(let i=0; i<tagA.length; i++){
        if(i != 1){
            let title = tagA[i].textContent.trim()
            let key = tagA[i].getAttribute('href')
            key = subStringKeyCategories(key)
            categories.push({
                title: title,
                key: key
            })
        }
    }
    return categories
}

function getAllCategory(data){
    let categories = []
    const dom = new JSDOM(data)
    let divClassMainNav = dom.window.document.getElementsByClassName('main-nav')[0]
    let tagUl = divClassMainNav.getElementsByTagName('ul')[0].children
    for(let i=0; i<tagUl.length; i++){
        if(i != 3 && i != 4 && i != 5){
            let title = tagUl[i].children[0].textContent.trim()
            let key = tagUl[i].getElementsByTagName('a')[0].getAttribute('href')
            key = subStringKeyCategories(key)
            let tagDivClassSubNav = tagUl[i].children[1]
            let items = getItemsCategories(tagDivClassSubNav)
            categories.push({
                title: title,
                key: key,
                items: items
            })
        }
    }
    return categories
}

function subStringKeyCategories(key){
    let keyPre = key
    let indexkt = keyPre.lastIndexOf('.')
    keyPre = keyPre.substring(1, indexkt)
    return keyPre
}

function getItemsCategories(tagDivClassSubNav){
    let items = []
    let tagLi = tagDivClassSubNav.getElementsByTagName('li')
    for(let i=0; i<tagLi.length; i++){
        let title = tagLi[i].textContent.trim()
        let key = tagLi[i].getElementsByTagName('a')[0].getAttribute('href')
        key = subStringKeyCategories(key)
        items.push({
            title: title,
            key: key
        })
    }
    return items
}
