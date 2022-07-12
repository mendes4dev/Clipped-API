const express = require('express')
const puppeteer = require('puppeteer')
const router = express.Router();

// Functions

async function getCourseData(token, year, courseDesignation){
    var data = {
        regente: ""
    } 
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://clip.unl.pt/utente/eu/aluno/ano_lectivo?ano_lectivo='+year)
    await page.setCookie({'name':'JServSessionIdroot1112','value':token});
    await page.goto('https://clip.unl.pt/utente/eu/aluno/ano_lectivo?ano_lectivo='+year)
    const linkHandlers = await page.$x("//a[contains(text(), '"+courseDesignation+"')]");
    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error("Link not found");
    }
    await page.waitForNavigation()

    // body > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)

    const regenteUnprocessed  = await page.$("body > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)")
    data.regente = await (await regenteUnprocessed.getProperty('textContent')).jsonValue()
    await browser.close()
    return data
}

router.get('/',(req,res)=>{
    res.send("Welcome to course!")
})

router.get('/getData', async function(req, res) {
    (async() => {
        const data = await getCourseData(req.headers.token, req.headers.year, req.headers.course)
        res.send(data)
    })();  
});

module.exports = router;