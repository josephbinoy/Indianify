const express=require('express');
const app=express();
const ejs=require('ejs');
const upload = require('./upload');
const vision = require('@google-cloud/vision');
const cheerio = require('cheerio');
const unirest = require('unirest');
var products = [];
var query="";
// const result = {};
// var details="";
// var verdict=false;
// var finalProducts=[];
// var promises=[];

app.set("view engine", 'ejs');
app.use(express.static('public'));

app.get("/", function(req, res){
    res.render("frontpage");
})

// Set up a route for file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    // Handle the uploaded file
    async function quickstart() {
        // Creates a client
        const client = new vision.ImageAnnotatorClient();
        
        // Performs label detection on the image file
        const [result] = await client.labelDetection(__dirname+"\\"+req.file.path);
        const labels = result.labelAnnotations;
        query=labels[0].description.replace(/ /g,"%20");
        console.log(query);
        res.redirect("/results");
        }
        quickstart();
    });

app.listen(3000, () => {
  console.log('Server listening on port 3000...');
});

async function search(query){
    const amazon_url = "https://www.amazon.in/s?k="+query;
    const head = {
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
    };
    const data = await unirest.get(amazon_url).headers(head)
    return { message:data.body };
}

app.get("/results", function(req, res){
    search(query).then((data) => {
    const $ = cheerio.load(data.message);
    $('div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.sg-col-4-of-20').each((_idx, el) => {
            const product = $(el)
            const title = product.find('span.a-size-base-plus.a-color-base.a-text-normal').text()
            const image = product.find('img.s-image').attr('src')
            const link = product.find('a.a-link-normal.a-text-normal').attr('href')
            let element = {
            title,
            image,
            link: `https://amazon.in${link}`
            }
            products.push(element)
            });       
            // for(let j=0; j<4;j++){
            //     checkIndia(products[j].link).then((data) => {
            //     const $ = cheerio.load(data.message);
            //     $('#detailBullets_feature_div > ul > li > span > span:nth-child(2)').each((i,el) => {
            //         result.title = $(el).text().trim();
            //         details=result.title;
            //         if(details=="India")
            //             verdict=true;
            //     });
            //     if(verdict==true)
            //         {   verdict=false;
            //             finalProducts.push(products[j]);
            //             console.log(finalProducts);}

            // });
            // }
            res.render("resultpage", {miiproducts: products});
        });
    });


// async function checkIndia(amazon_url){
//     const head = {
//         "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
//     };
//     const data = await unirest.get(amazon_url).headers(head)
//     return { message:data.body };
// }



