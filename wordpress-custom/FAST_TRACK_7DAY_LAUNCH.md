# Fast-Track WordPress Implementation — 7-Day Launch (FINAL)

**Launch deadline:** Next week  
**Domain:** sweetnsassyknox.com  
**Contact:** 865-227-7667 | tandalyn@sweetnsassyknox.com  
**Social:** @sweetnsassycatering  
- Facebook: facebook.com/sweetnsassycatering  
- Instagram: instagram.com/sweetnsassycatering  
- YouTube: youtube.com/@sweetnsassycatering  

---

## DAY 1 (Monday): Foundation — 4–5 hours

- [ ] Install Astra theme (Appearance → Themes → Add New)
- [ ] Create Astra child theme
- [ ] Add functions.php code to child theme (`wp-content/themes/astra-child/`)
- [ ] Add custom-style.css to Appearance → Customize → Additional CSS
- [ ] Upload logo: `wordpress-assets/logos/sweetnsassylogo_name_tp.png`
- [ ] Upload favicon: `wordpress-assets/favicon/favicon.png`
- [ ] Configure Site Identity:
  - Site Title: **Sweet n' Sassy**
  - Tagline: **Authentic Creole Soul Food in Knoxville, TN**
  - Logo and Site Icon
- [ ] Create primary navigation menu
- [ ] Set permalink structure to "Post name" (Settings → Permalinks)

---

## DAY 2 (Tuesday): Core Pages — 5–6 hours

- [ ] Create 5 ESSENTIAL pages:

  1. **Home** — Use `page-content/homepage-content-FINAL.md`  
     - Set as homepage in Settings → Reading

  2. **Menu** — Use `page-content/menu-page-intro-FINAL.md` (WooCommerce products added Day 3)

  3. **Catering** — Use `page-content/catering-page-content-FINAL.md`

  4. **Locations** — Use `page-content/locations-page-content-FINAL.md`

  5. **Contact** — Use `page-content/contact-page-content-FINAL.md`

- [ ] Upload images:
  - Hero: `wordpress-assets/hero/foodtruck.jpeg`
  - Featured food photos (3–5 best from `wordpress-assets/food-photos/`)
  - Menu image: `wordpress-assets/menu/`
- [ ] Add all 5 pages to navigation menu
- [ ] Add phone (865-227-7667) and email (tandalyn@sweetnsassyknox.com) to header or footer
- [ ] Add social media icons linking to @sweetnsassycatering:
  - Facebook → https://facebook.com/sweetnsassycatering
  - Instagram → https://instagram.com/sweetnsassycatering
  - YouTube → https://youtube.com/@sweetnsassycatering

---

## DAY 3 (Wednesday): WooCommerce Setup — 5–6 hours

- [ ] Install WooCommerce plugin
- [ ] Run setup wizard:
  - Store Address: Knoxville, TN
  - Currency: USD
  - Skip shipping for now
  - Skip tax for now
- [ ] Install "Square for WooCommerce" plugin
- [ ] Connect Square account (use existing Square credentials)
- [ ] Import TOP 10 products from `sample-products.csv`:
  1. Shrimp and Grits (SIGNATURE — set as featured)
  2. Creole Jambalaya
  3. Seafood Gumbo
  4. Shrimp Po' Boy
  5. BBQ Pulled Pork Sandwich
  6. Mac and Cheese
  7. Collard Greens
  8. Bread Pudding
  9. Sweet Tea
  10. 1 Catering Package (Small Party: 10–25 people)
- [ ] Assign product images from `wordpress-assets/food-photos/`
- [ ] Set product categories
- [ ] Test checkout with Square (use Square test mode first)
- [ ] Configure "Local Pickup" as shipping method

---

## DAY 4 (Thursday): Forms — 3–4 hours

- [ ] Install WPForms (free version)
- [ ] Create **Catering Inquiry Form**:
  - Name, Email, Phone (required)
  - Event Date (date picker)
  - Number of Guests
  - Event Type (dropdown: Wedding, Corporate, Birthday, Other)
  - Message / Special Requests
  - Notification to: **tandalyn@sweetnsassyknox.com**
- [ ] Create **Contact Form**:
  - Name, Email, Phone, Subject, Message
  - Notification to: **tandalyn@sweetnsassyknox.com**
- [ ] Embed catering form on Catering page
- [ ] Embed contact form on Contact page
- [ ] Test both forms (send test submissions)

---

## DAY 5 (Friday): Location Tracker & Content Polish — 4–5 hours

- [ ] Add 3 Food Truck Locations for next week using custom post type (Locations → Add New):
  - Location 1: e.g. Downtown Market Square — Wed 11am–2pm
  - Location 2: e.g. West Town Mall — Fri 5pm–8pm
  - Location 3: e.g. Private Event — Sat (booking)
- [ ] Display locations on Locations page (shortcode or manual list)
- [ ] Add social media links to footer:
  - Facebook icon → https://facebook.com/sweetnsassycatering
  - Instagram icon → https://instagram.com/sweetnsassycatering
  - YouTube icon → https://youtube.com/@sweetnsassycatering
- [ ] Proofread all 5 pages for typos
- [ ] Replace any remaining placeholder text
- [ ] Check mobile responsiveness on phone
- [ ] Verify contact info everywhere:
  - 865-227-7667 (clickable on mobile)
  - tandalyn@sweetnsassyknox.com

---

## DAY 6 (Saturday): SEO & Testing — 4 hours

- [ ] Install Yoast SEO (free version)
- [ ] Configure SEO for 5 pages using `page-content/seo-metadata-FINAL.json`:
  - Focus keywords
  - Meta titles (60 chars)
  - Meta descriptions (160 chars)
- [ ] Full site testing:
  - Click every navigation link
  - Test contact form submission
  - Test catering form submission
  - Add item to cart → complete checkout with Square
  - Test on mobile (iPhone/Android)
  - Test on desktop (Chrome, Safari, Firefox)
  - Verify phone number is clickable (tel: link)
  - Verify email is clickable (mailto: link)
  - Check all social media links work
- [ ] Fix any broken links or issues

---

## DAY 7 (Sunday): LAUNCH — 2–3 hours

- [ ] Pre-launch checklist (see LAUNCH_DAY_CHECKLIST.md)
- [ ] SSL certificate active (https://sweetnsassyknox.com)
- [ ] Take final backup
- [ ] Remove maintenance mode / "Coming Soon" page
- [ ] Test homepage loads: sweetnsassyknox.com
- [ ] Test from different device/network
- [ ] Announcement posts:
  - **Facebook:** "We're live online! Order now at sweetnsassyknox.com 🎉"
  - **Instagram:** Same + link in bio
  - **YouTube:** Community post
- [ ] Monitor site for first 2 hours
- [ ] Respond to any test orders/inquiries

---

## TOTAL ESTIMATED TIME

**27–33 hours over 7 days** (about 4–5 hours per day)

---

## SKIP FOR NOW (Add after launch)

- About page (week 2)
- Recipes / YouTube membership (week 3)
- Remaining 10–15 products (week 2)
- Blog section
- Advanced features

---

## Content & Assets Reference

| Item | Location |
|------|----------|
| Page content | `wordpress-custom/page-content/*-FINAL.md` |
| SEO data | `wordpress-custom/page-content/seo-metadata-FINAL.json` |
| Images | `wordpress-assets/` (logos, favicon, hero, food-photos, menu) |
| Custom code | `wordpress-custom/functions.php`, `wordpress-custom/custom-style.css` |
| Square setup | `wordpress-custom/square-payment-setup.md` |
