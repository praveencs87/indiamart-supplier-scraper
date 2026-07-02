# IndiaMART Supplier Lead Scraper

**Extract highly valuable B2B supplier profiles, company names, cities, trust seals, and publicly visible contact data directly from IndiaMART category pages.**

IndiaMART is the backbone of Indian B2B eCommerce. However, manually compiling lists of suppliers, manufacturers, and wholesalers from their category pages takes hours. 

This actor utilizes a high-speed static scraper built on `Cheerio` and `got-scraping` (for browser TLS fingerprinting to bypass bot protections). It instantly sweeps through category pages to compile highly structured B2B lead datasets.

## What can this Actor do?

- ✅ **Supplier Extraction** - Extracts the supplier/company name and a direct link to their IndiaMART profile.
- ✅ **Location Data** - Grabs the city or region where the supplier is based.
- ✅ **Trust & Verification** - Extracts trust badges (e.g., "TrustSEAL", "Verified Exporter") so you can filter for high-quality manufacturers.
- ✅ **Pricing & Products** - Extracts the primary product advertised in the card and any visible pricing snippets.
- ✅ **Public Contact Data** - Captures any partially masked phone numbers or contact reference strings available in the public HTML without requiring a login session.

## Why use this Actor?

- 🎯 **B2B Lead Generation** - Instantly build a database of manufacturers or wholesalers for your specific niche.
- 🤝 **Procurement & Sourcing** - Find the top-rated, Verified suppliers in specific cities (e.g., "Cotton Fabric suppliers in Surat").
- 📊 **Market Research** - Analyze the concentration of suppliers and pricing for a specific commodity.

## How to use it

1. Enter a list of IndiaMART category URLs into the **Search/Category URLs** field.
   - *(e.g., `https://dir.indiamart.com/impcat/cotton-fabric.html`)*
2. Set the **Max Leads to Extract** limit to prevent massive categories from running endlessly (default is 500).
3. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the exact number of leads extracted!
- **$2.00 per 1,000 leads extracted.**

## Output Example

When a supplier lead is extracted, the actor pushes this data to your dataset:

```json
{
  "supplierName": "Shree Ram Textiles",
  "profileUrl": "https://www.indiamart.com/shreeram-textiles-surat/",
  "location": "Surat, Gujarat",
  "primaryProduct": "Printed Cotton Fabric",
  "price": "₹ 45 / Meter",
  "trustSeals": ["TrustSEAL Verified", "Star Supplier"],
  "contactInfo": "+91-98765XXXXX",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
