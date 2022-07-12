const express = require('express')
const puppeteer = require('puppeteer')
const router = express.Router();

// Functions 

async function getYears(token){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://clip.unl.pt/utente/eu/aluno')
    await page.setCookie({'name':'JServSessionIdroot1112','value':token});
    await page.goto('https://clip.unl.pt/utente/eu/aluno')

    const years = await page.evaluate(()=>{
        // body > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr > td> em > a
      return Array.from(document.querySelectorAll('body > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr > td > em > a')).map(
            x => x.textContent
        )
    })
    await browser.close()
    return years
}

async function getCoursesOfYear(token,year){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://clip.unl.pt/utente/eu/aluno')
    await page.setCookie({'name':'JServSessionIdroot1112','value':token});
    await page.goto('https://clip.unl.pt/utente/eu/aluno')
    const years = await page.evaluate(()=>{
        // body > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr > td> em > a
      return Array.from(document.querySelectorAll('body > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr > td > em > a')).map(
            x => x.textContent
        )
    })
    const indexWanted = years.indexOf(year)
    await Promise.all([
        page.click('body > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+(indexWanted+1)+') > td > em > a'),
        page.waitForNavigation({waitUntil: 'networkidle2'})
    ])
    const courses = await page.evaluate(()=>{
      return Array.from(document.querySelectorAll('body > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > em:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr > td > a')).map(
            x => x.textContent
        )
    })
    await browser.close()
    return courses
}

//Main Route

router.get('/',(req,res)=>{
    res.send("Welcome to courses!")
})

router.get('/years',(req,res)=>{
    (async() => {
        const data = await getYears(req.headers.token)
        res.send(data)
    })();   
})

router.get('/coursesYear',(req,res)=>{
    (async() => {
        const data = await getCoursesOfYear(req.headers.token,req.headers.year)
        res.send(data)
    })();  
})

module.exports = router;