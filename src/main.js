import { armKillSwitch, disarmKillSwitch } from './utils/timeoutManager.js';
import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.searchUrls || input.searchUrls.length === 0) {
        throw new Error('searchUrls input is required!');
    }

    const { searchUrls, maxLeads = 500 } = input;

    let totalLeadsExtracted = 0;

    const crawler = new CheerioCrawler({
        maxConcurrency: 5,
        // IndiaMART blocks heavily, so we add a delay
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log }) {
            const url = request.url;
            log.info(`Scraping IndiaMART category: ${url}`);
            
            // Check for bot block
            if ($('title').text().toLowerCase().includes('security check') || $('title').text().toLowerCase().includes('captcha')) {
                throw new Error('Blocked by IndiaMART security check. Retrying with different fingerprint...');
            }

            // Select the main product/supplier cards
            const cards = $('div.ls_tpBox, section.cat-prd-crd, div.lst_cl').toArray();
            let leadsOnPage = 0;

            for (const card of cards) {
                if (totalLeadsExtracted >= maxLeads) break;

                const el = $(card);
                
                // Supplier Name & URL
                let supplierName = el.find('h4.lcname, span.lcname, div.company-name').text().trim() || el.find('.gcnm').text().trim();
                let profileUrl = el.find('h4.lcname a, .gcnm a').attr('href') || el.find('.company-name a').attr('href') || null;
                
                if (profileUrl && !profileUrl.startsWith('http')) {
                    profileUrl = `https:${profileUrl.startsWith('//') ? profileUrl : '//' + profileUrl}`;
                }

                // Location
                let location = el.find('span.cty-t, span.ls_city, p.smcty').text().trim() || null;
                
                // Primary Product & Price
                let primaryProduct = el.find('h3 a, h2.lg, .prd-name').first().text().trim() || null;
                let price = el.find('span.prc, div.price').text().trim() || null;
                if (price) price = price.replace(/\s+/g, ' '); // Clean up extra spaces
                
                // Trust Seals
                const trustSeals = [];
                el.find('.tsIcon, .ver, .stars, img[src*="trustseal"]').each((_, seal) => {
                    const alt = $(seal).attr('alt') || $(seal).attr('title');
                    if (alt) trustSeals.push(alt.trim());
                    else if ($(seal).hasClass('tsIcon')) trustSeals.push('TrustSEAL Verified');
                    else if ($(seal).hasClass('ver')) trustSeals.push('Verified Supplier');
                });

                // Public Contact Info (Masked Phone or Call-To-Action attributes)
                let contactInfo = el.find('.phn, .pns_h, .contact-number').text().trim() || null;
                if (!contactInfo) {
                    // Check for hidden attributes
                    contactInfo = el.find('[data-gl]').attr('data-gl') || el.find('[data-phone]').attr('data-phone') || null;
                }

                // If we couldn't find a supplier name, it might be an ad or unrelated card
                if (!supplierName) continue;

                const output = {
                    supplierName,
                    profileUrl,
                    location,
                    primaryProduct,
                    price,
                    trustSeals,
                    contactInfo,
                    scrapedAt: new Date().toISOString()
                };

                await Actor.pushData(output);
                
                totalLeadsExtracted++;
                leadsOnPage++;
                
                // PPE Monetization
                await Actor.charge({ eventName: 'lead-extracted', count: 1 });
            }

            log.info(`✅ Extracted ${leadsOnPage} supplier leads from this page. Total so far: ${totalLeadsExtracted}`);
            
            // Basic Pagination handling (Enqueueing next page)
            if (totalLeadsExtracted < maxLeads) {
                const nextBtn = $('a.next, a.npf, a[rel="next"]').attr('href');
                if (nextBtn) {
                    let nextUrl = nextBtn.startsWith('http') ? nextBtn : new URL(nextBtn, 'https://dir.indiamart.com').href;
                    log.info(`Enqueueing next page: ${nextUrl}`);
                    await crawler.addRequests([nextUrl]);
                }
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Failed to scrape ${request.url} after multiple retries.`);
        },
    });

    log.info(`Starting IndiaMART crawler for ${searchUrls.length} start URLs...`);
    
    await crawler.addRequests(searchUrls);
    armKillSwitch(crawler);
    await crawler.run();
    disarmKillSwitch();

    log.info(`🎉 Finished! Extracted ${totalLeadsExtracted} supplier leads.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
