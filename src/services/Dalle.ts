import {Service} from '@/decorators'
import {Database, Logger} from '@/services'
import {EntityRepository} from "@mikro-orm/core";
import {Cookie, Generation, User} from "@/entities";
import {header} from "case";
import * as cheerio from 'cheerio';
import {AxiosError} from "axios";

const merge = (a: any, b: any, predicate = (a: any, b: any) => a === b) => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem: any) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
}

interface ResultPoll {
    completed: boolean
    urls: string[]
    cookie: string
    error: string
}

const poll = async function (fn: Function, fnCondition: (result: ResultPoll) => boolean, ms: number, maxIter: number) {
    let result = await fn();
    let i = 0
    while (fnCondition(result) && i < maxIter) {
        ++i
        await wait(ms);
        result = await fn();
    }
    return result;
};

const wait = function (ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

@Service()
export class Dalle {
    private cookieRepo: EntityRepository<Cookie>
    private userRepo: EntityRepository<User>
    private generationRepo: EntityRepository<Generation>

    constructor(
        private db: Database,
        private logger: Logger
    ) {
        this.logger.console('Service Dalle invoked !', 'info')

        this.cookieRepo = this.db.get(Cookie)
        this.userRepo = this.db.get(User)
        this.generationRepo = this.db.get(Generation)

    }

    getHeaders(cookie: string) {
        const getRandomNum = () => {
            // Get random ip number
            return Math.floor(Math.random() * 254) + 1
        }

        const headers = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Alt-Used': 'www.bing.com',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            Cookie: `_U=${cookie};`,
            'X-Forwarded-For': `20.${getRandomNum()}.${getRandomNum()}.${getRandomNum()}`,
        }

        return headers
    }


    /**
     * Check if the images have been generated or not.
     * @param eventID eventId fetched in create picture
     * @param cookie _U Cookie
     * @param headers headers linked to GET request
     */
    async pollForBingPicture(eventID: string, cookie: string, headers: any) {
        const init_referrer = 'https://www.bing.com/images/create?FORM=GENEXP'
        const apiHost = `https://www.bing.com/images/create/async/results/1-${eventID}`

        const response = await fetch(`${apiHost}`, {
            method: 'GET',
            headers: headers,
        })

        const responseText = await response.text()

        let pictureUrls = []
        let resultProcured = false

        if (responseText.includes('2zU3AJUdkgFe7ZKv19yPBHVs') ||
            responseText.includes('TX9QuO3WzcCJz1uaaSwQAz39Kb0'))
            return {completed: true, urls: [], cookie: cookie, error: 'Images censored'}


        const $ = cheerio.load(responseText)
        //         if (
        //             !match[1].includes('2zU3AJUdkgFe7ZKv19yPBHVs') &&
        //             !match[1].includes('TX9QuO3WzcCJz1uaaSwQAz39Kb0')
        for (let i = 0; i < $('.mimg').length; i++) {
            const badLink = $('.mimg')[i].attribs.src
            const goodLink = badLink.slice(0, badLink.indexOf('?')) // Delete the parameters

            pictureUrls.push(goodLink)
        }

        // Decrease amount of cookies by one if we succeed and everything wasn't censored
        if (pictureUrls.length) {
            resultProcured = true
            const cookieRepo = this.db.get(Cookie)
            const ref = await cookieRepo.findOne({id: cookie});
            ref!.tokens = ref!.tokens - 1;
            await cookieRepo.persistAndFlush(ref!)
        }
        return {completed: resultProcured, urls: pictureUrls, cookie: cookie, error: 'timeout'}
    }

    /**
     * Create one picture from a prompt and bing cookie.
     * @param prompt creation prompt
     * @param n number of creation attempts
     * @param userId user
     */
    async createManyPictures(prompt: string, n: number, userId:string) {
        const cookieRepo = this.db.get(Cookie)
        // Fetch cookies that still have available tokens
        const cookies = await cookieRepo.find({tokens: {$gt: 0}}, {
            populate: ['id'],
            limit: n,
        });

        if (cookies.length === 0)
            return {
                completed: false,
                urls: [],
                cookie: '',
                error: 'The cookie jar is empty. Refill it to enable further generations.'
            }

        let res = []
        // For each available cookie, launch a simultaneous picture request
        try {
            res = await Promise.all(cookies.map(c => {
                return this.createPicture(prompt, c.id)
            }))
        } catch (error: unknown) {
            return {completed: false, urls: [], cookie: '', error: error}
        }

        let pictureUrls: string[] = []

        let expendedTokens = 0
        res.forEach((r) => {
           if (r.completed && r.urls.length)
           {
               pictureUrls = merge(pictureUrls, r.urls)
               ++expendedTokens;
           }
        })
        if (expendedTokens)
            await this.updatedSpentTokens(userId, expendedTokens)
        // if (res.find((r) => r.completed))

        return {completed: true, urls: pictureUrls, cookie: '', error: 'All pictures censored'}
        // return { completed: false, urls: pictureUrls, cookie:'', error: 'Timeout or every images were censored' }
    }

    /**
     * Create one picture from a prompt and bing cookie.
     * @param prompt creation prompt
     * @param cookieValue cookie of the account used for generation
     */
    async createPicture(prompt: string, cookieValue: string) {
        // Check if cookie is valid first?
        const apiHost = 'https://www.bing.com/images/create'
        const init_referrer = 'https://www.bing.com/images/create?FORM=GENEXP'

        const formData = new FormData()
        formData.append('q', prompt)
        formData.append('qs', 'ds')
        // 4 =  fast mode, 3 =  slow mode
        const rt = '4'
        const headers = this.getHeaders(cookieValue)

        const response = await fetch(
            `${apiHost}?q=${prompt}&rt=${rt}&FORM=GENCRE`,
            {
                method: 'POST',
                headers: headers
            }
        )


        // console.log(`status is ${response.status}`)
        const isSlowMode = false
        const credits = 15
        const responseHtml = await response.text()

        if (response.status === 200) {
            const $ = cheerio.load(responseHtml)
            const errorAmount = $('.gil_err_img.rms_img').length
            if (!isSlowMode && credits > 0 && $('#gilen_son').hasClass('show_n')) {
                throw 'Dalle-3 is currently unavailable due to high demand'
            } else if (
                $('#gilen_son').hasClass('show_n') ||
                (errorAmount === 2 && credits > 0 && isSlowMode)
            ) {
                throw 'Slow mode is currently unavailable due to high demand'
            } else if (errorAmount === 2) {
                //We don't want to throw, since this error won't affect other requests in promise.all
                return {completed: false, urls: [], cookie: cookieValue, error: 'Invalid cookie'}
                // throw 'Invalid cookie'
            } else if (errorAmount === 4) {
                throw 'Prompt has been blocked'
            }
            // else {
            //     console.log(responseHtml)
            //     throw responseHtml
            // }
        }

        // fetch true event Id
        const regex = /results\/1-([a-z0-9]*)\?q/
        // const regex = /EventID:"[a-z0-9]+"/
        // const splitFirstMatch = theFirstMatch[0].split(`EventID:"`)
        // const extractedEventId = splitFirstMatch[1].split(`"`)[0]
        const matches = responseHtml.match(regex)

        if (!matches || matches?.length < 2)
            return {completed: false, urls: [], cookie: cookieValue, error: 'Cannot find event Id'}
        
        const eventId = matches![1]

        // Run FetchPoll in a loop until we get a result or until timeout
        let fetchPoll = () => this.pollForBingPicture(eventId, cookieValue, headers);
        let validate = (result: ResultPoll) => !result.completed;
        let response2: ResultPoll = await poll(fetchPoll, validate, 4000, 5);
        console.log(response2)
        return response2
    }


    /**
     * Check every cookie in db, sends back total amount of tokens available.
     */
    async checkAllCookies() {
        const cookieRepo = this.db.get(Cookie)
        const cookies = await cookieRepo.findAll()

        const res = await Promise.allSettled(cookies.map(c => this.checkCookie(c.id)))

        let totalCookies = 0
        res.forEach((r, index) => {
            totalCookies += r.status === 'fulfilled' && r.value >= 0 ? r.value : 0
            cookies[index].tokens = r.status === 'fulfilled'  && r.value >= 0  ? r.value : 0
        })
        // update all cookies
        await cookieRepo.flush();


        return totalCookies
        // cookies.forEach()
    }

    /**
     * Check how many tokens are available, and update the cookie value in DB.
     * @param cookie _U cookie
     */
    async checkAndUpdateCookie(cookie: string) {
        const response = await fetch(`https://www.bing.com/images/create`, {
            method: 'GET',
            headers: {
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.5',
                Connection: 'keep-alive',
                DNT: '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                TE: 'trailers',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
                cookie: `_U=${cookie}`,
            },
        })
        const responseText = await response.text()

        const regex = /data-tb="([0-9]*)"/
        const matches = responseText.match(regex)
        if (!matches)
            return (-1)

        const cookieRepo = this.db.get(Cookie)
        const ref = await cookieRepo.findOne({id: cookie});
        ref!.tokens = matches ? parseInt(matches[1]) : 0;
        await cookieRepo.persistAndFlush(ref!)

        return matches ? parseInt(matches[1]) : 0
    }

    /**
     * Check if cookie is valid.
     * @param cookie _U cookie
     */
    async checkCookie(cookie: string) {
        const initReferrer = 'https://www.bing.com/images/create'

        const response = await fetch(`https://www.bing.com/images/create`, {
            method: 'GET',
            headers: {
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.5',
                Connection: 'keep-alive',
                DNT: '1',
                Referer: initReferrer,
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                TE: 'trailers',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
                cookie: `_U=${cookie}`,
            },
        })
        const responseText = await response.text()

        const regex = /data-tb="([0-9]*)"/
        const matches = responseText.match(regex)

        return matches ? parseInt(matches[1]) : 0
    }


    /**
     * Check validity of new cookie and registers it.
     * @param cookie _U cookie
     */
    async validateAndRegisterCookie(cookie: string) {

        const tokenCount = await this.checkCookie(cookie)
        if (tokenCount < 0)
            return ('Error! Cookie is invalid or bing is unavailable')
        else {
            const newCookie = new Cookie()
            newCookie.tokens = tokenCount
            newCookie.id = cookie
            try {
                await this.cookieRepo.persistAndFlush(newCookie)
            } catch (error) {
                return ('Error! Duplicate ?')
            }
            return ('Success! Cookie has ' + tokenCount + ' tokens available')
        }
    }

    /**
     * Record successful prompt and pictures
     * @param prompt
     * @param urls
     */
    async createGeneration(prompt: string, urls: string[]) {
        let gen = new Generation()
        gen.prompt = prompt
        gen.generations = urls
        await this.generationRepo.persistAndFlush(gen)
    }

    /**
     * Add one to contributedCookies property of user
     * @param userId
     * @param tokenNumber
     */
    async updatedSpentTokens(userId: string, tokenNumber: number) {
        const userRepo = this.db.get(User)
        const user = await userRepo.findOne({id: userId})

        if (!user)
            return 'Error'
        user.usedTokens = user.usedTokens + tokenNumber
        await userRepo.persistAndFlush(user)
    }

    /**
     * Add one to contributedCookies property of user
     * @param userId
     */
    async addOneContributedCookie(userId: string) {
        const userRepo = this.db.get(User)

        const user = await userRepo.findOne({id: userId})

        if (!user)
            return 'Error'
        user.contributedCookies = user.contributedCookies + 1
        await userRepo.persistAndFlush(user)
    }
}