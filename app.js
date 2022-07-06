const express = require('express')
const puppeteer = require('puppeteer')
const app = express()


// Import Routes
const coursesRoute = require('./routes/courses');

app.use('/courses',coursesRoute)

async function login(username, password){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://clip.unl.pt/')
    await page.type('input[name="identificador"]',username)
    await page.type('input[name="senha"]',password)
    await Promise.all([page.click('[class="button"]'),page.waitForNavigation()])
    const cookies = await page.cookies()
    const token = cookies.find(x => x.name == 'JServSessionIdroot1112').value;
    await browser.close()
    return token
}

async function GetPersonalData(token){
    var data = {
        name: "",
        course: "",
        registrationsYears: "",
        ects: "",
        currentGrade: ""
    }
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://clip.unl.pt/utente/eu/aluno')
    await page.setCookie({'name':'JServSessionIdroot1112','value':token});
    await page.goto('https://clip.unl.pt/utente/eu/aluno')

    const nameUnprocessed = await page.$("body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > h3:nth-child(1)")
    data.name = (await (await nameUnprocessed.getProperty('textContent')).jsonValue())
    indexOfFLName = data.name.indexOf('-') + 2;
    indexOfLLName = data.name.indexOf('(') - 1;
    data.name = data.name.substring(indexOfFLName,indexOfLLName)
    indexOfSpace = data.name.indexOf(' ');
    data.name = data.name.substring(0,indexOfSpace)

    const courseUnprocessed  = await page.$("body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)")
    data.course = await (await courseUnprocessed.getProperty('textContent')).jsonValue()
    
    const registrationsYearsUnprocessed = await page.$("body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(1)")
    data.registrationsYears = (await (await registrationsYearsUnprocessed.getProperty('textContent')).jsonValue()).replace("Anos de inscrição:","")

    const ectsUnprocessed = await page.$("body > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(3)")
    data.ects = (await (await ectsUnprocessed.getProperty('textContent')).jsonValue()).replace("Período curricular: 2Total de ECTS: ","")

    await page.goto("https://clip.unl.pt/utente/eu/aluno/situa%E7%E3o/resumo")

    const currentGradeUnprocessed = await page.$("body > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > div:nth-child(2) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1)")  
    data.currentGrade = (await (await currentGradeUnprocessed.getProperty('textContent')).jsonValue()).replace(" valores","")
    await browser.close()
    return data;
}

// ROUTES

app.get('/',(req,res)=>{
    (async() => {
        let buff = new Buffer.from(req.headers.authorization.replace("Basic ",""), 'base64')
        let decodedCredentials = buff.toString('ascii')
        const index = decodedCredentials.indexOf(':')
        const token = await login(decodedCredentials.substring(0,index),decodedCredentials.substring(index+1,decodedCredentials.length))
        res.send(token)
    })();  
})

app.get('/personaldata',(req,res)=>{
    (async() => {
        const data = await GetPersonalData(req.headers.token)
        res.send(data)
    })();  
})


//How we start listening to the server
app.listen(3000)
