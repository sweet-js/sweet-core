# WordPress Plugin Setup Guide
## Sweet n' Sassy - Creole Soul Food

**Business:** Sweet n' Sassy  
**Cuisine:** Creole Soul Food  
**Location:** Knoxville, TN  
**Services:** Food Truck + Catering

---

## 📋 Plugin Installation Priority

Install plugins in this order to avoid dependency issues and ensure proper configuration.

---

## 🚀 PHASE 1: Essential Foundation Plugins

### 1. **WooCommerce** (FREE)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Purpose:** Online ordering and e-commerce functionality

**Installation:**
1. Go to **Plugins → Add New**
2. Search "WooCommerce"
3. Install and activate
4. Run setup wizard

**Configuration Steps:**
- Store address: **Knoxville, TN**
- Currency: USD ($)
- Industry: Food & Drink
- Product types: Physical products
- Enable: Payments, Shipping, Taxes
- See `woocommerce-config.json` for detailed settings

**Settings to Configure:**
- **WooCommerce → Settings → General:**
  - Store Address: Knoxville, TN
  - Enable guest checkout: Yes
  - Enable account creation: Yes
  - Cart page: Create "Cart" page
  - Checkout page: Create "Checkout" page
  - My account page: Create "My Account" page

**Dependencies:** None  
**Premium Alternative:** None needed (free version is sufficient)

---

### 2. **Contact Form 7** (FREE) or **WPForms Lite** (FREE)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Purpose:** Contact forms and catering inquiry forms

**Option A: Contact Form 7 (Recommended for Free)**
- **Installation:** Plugins → Add New → Search "Contact Form 7"
- **Pros:** Lightweight, flexible, widely supported
- **Cons:** Requires HTML knowledge for advanced forms

**Option B: WPForms Lite**
- **Installation:** Plugins → Add New → Search "WPForms"
- **Pros:** Drag-and-drop builder, easier for beginners
- **Cons:** Limited features in free version

**Configuration:**
- Create contact form (see `form-templates/contact-form.json`)
- Create catering inquiry form (see `form-templates/catering-inquiry-form.json`)
- Add forms to pages using shortcodes

**Premium Alternative:** 
- WPForms Pro ($39.50/year) - More form fields, conditional logic
- Gravity Forms ($59/year) - Advanced form builder

---

### 3. **Yoast SEO** (FREE) or **Rank Math** (FREE)
**Priority:** ⭐⭐⭐⭐ HIGH  
**Purpose:** SEO optimization for local Knoxville market

**Option A: Yoast SEO**
- **Installation:** Plugins → Add New → Search "Yoast SEO"
- **Features:** Meta descriptions, XML sitemap, breadcrumbs, local SEO
- **Setup:** Run configuration wizard

**Option B: Rank Math**
- **Installation:** Plugins → Add New → Search "Rank Math"
- **Features:** More features in free version than Yoast, local SEO
- **Setup:** Run setup wizard

**Configuration:**
- Set up Google Search Console
- Configure XML sitemap
- Set default meta descriptions
- Enable breadcrumbs
- **Local SEO:** Add Knoxville, TN as business location
- Add business schema markup for restaurant/food truck

**Premium Alternative:** Yoast SEO Premium ($99/year) - Advanced features

---

## 🛒 PHASE 2: WooCommerce Payment Integration

### 4. **Square for WooCommerce** (FREE - OFFICIAL)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Purpose:** Square payment processing (you already use Square)

**Installation:**
1. Go to **Plugins → Add New**
2. Search "Square for WooCommerce"
3. Install and activate (official plugin by WooCommerce)
4. Go to **WooCommerce → Settings → Payments → Square**

**Configuration:**
- Connect your existing Square account
- Enable Square payment method
- Configure settings (see `square-payment-setup.md` for detailed guide)
- Enable test mode initially for testing
- Set up production mode after testing

**Important:** This is the official Square plugin - use this, not third-party plugins.

**Setup Guide:** See `square-payment-setup.md` for complete setup instructions.

**Dependencies:** WooCommerce must be installed first  
**Premium Alternative:** None needed (official plugin is free)

---

## 📍 PHASE 3: Location & Event Management

### 5. **The Events Calendar** (FREE)
**Priority:** ⭐⭐⭐⭐ HIGH  
**Purpose:** Display food truck schedule and locations

**Installation:**
1. Go to **Plugins → Add New**
2. Search "The Events Calendar"
3. Install and activate
4. Go to **Events → Settings**

**Configuration:**
- Set timezone: Eastern Time (Knoxville)
- Enable event views: List, Month, Day
- Configure event display settings
- Link to Food Truck Locations custom post type (optional)

**Alternative:** Use custom post type from `functions.php` (already configured)

**Premium Alternative:** Events Calendar Pro ($89/year) - Advanced features, recurring events

---

### 6. **Google Maps Widget** (FREE)
**Priority:** ⭐⭐⭐⭐ HIGH  
**Purpose:** Display food truck locations on map (Knoxville area)

**Installation:**
1. Go to **Plugins → Add New**
2. Search "Google Maps Widget"
3. Install and activate

**Configuration:**
1. Get Google Maps API Key:
   - Go to https://console.cloud.google.com
   - Create project
   - Enable Maps JavaScript API
   - Create API key
   - Restrict API key to your domain
2. Add API key in plugin settings
3. Create map widgets for locations page
4. Center map on Knoxville, TN area

**Alternative Plugins:**
- **WP Google Maps** (FREE) - More features
- **Maps Marker Pro** (PREMIUM $39/year) - Advanced mapping

**Premium Alternative:** WP Google Maps Pro ($39/year)

---

## 🎥 PHASE 4: Media & Content

### 7. **YouTube Embed Plus** (FREE) or **Embed Plus for YouTube** (FREE)
**Priority:** ⭐⭐⭐ MEDIUM  
**Purpose:** Enhanced YouTube video embeds for recipe videos

**Installation:**
1. Go to **Plugins → Add New**
2. Search "YouTube Embed Plus" or "Embed Plus for YouTube"
3. Install and activate

**Configuration:**
- Enable lazy loading
- Configure video player settings
- Set default video size
- Enable playlists for recipe collections

**Alternative:** WordPress native YouTube embeds (works without plugin)

**Premium Alternative:** Embed Plus Pro ($39/year) - Advanced features

---

### 8. **Smush** (FREE) or **ShortPixel Image Optimizer** (FREE)
**Priority:** ⭐⭐⭐⭐ HIGH  
**Purpose:** Additional image optimization for food photos

**Option A: Smush**
- **Installation:** Plugins → Add New → Search "Smush"
- **Features:** Compress images, lazy loading
- **Free Limit:** 50 images/month

**Option B: ShortPixel**
- **Installation:** Plugins → Add New → Search "ShortPixel"
- **Features:** Better compression, WebP conversion
- **Free Limit:** 100 images/month

**Configuration:**
- Enable automatic compression
- Enable WebP conversion (recommended)
- Enable lazy loading
- Optimize existing images in Media Library

**Premium Alternative:** 
- Smush Pro ($60/year) - Unlimited images
- ShortPixel ($9.99/year) - More images

---

## 🔒 PHASE 5: Membership & Content Restriction

### 9. **Paid Memberships Pro** (FREE) or **MemberPress** (PREMIUM)
**Priority:** ⭐⭐⭐ MEDIUM (if using membership area for recipes)

**Option A: Paid Memberships Pro (FREE)**
- **Installation:** Plugins → Add New → Search "Paid Memberships Pro"
- **Features:** Free membership plugin, basic features
- **Setup:** Configure membership levels, payment gateways
- **Integration:** Works with Square for payments

**Option B: MemberPress (PREMIUM $149/year)**
- **Installation:** Purchase from https://memberpress.com
- **Features:** More features, better UI, easier setup
- **Best for:** If you want premium experience

**Configuration:**
- Create membership levels:
  - Free: Limited recipe access (3-5 videos)
  - Premium: Full recipe access ($X/month or one-time)
- Set up payment integration (Square)
- Protect recipe pages/content
- Set up email notifications

**Premium Alternative:** MemberPress ($149/year) - Better features, Square integration

---

## ⚡ PHASE 6: Performance & Caching

### 10. **WP Rocket** (PREMIUM) or **W3 Total Cache** (FREE)
**Priority:** ⭐⭐⭐⭐ HIGH

**Option A: WP Rocket (PREMIUM $59/year)**
- **Best for:** Easiest to use, best performance
- **Features:** Page caching, database optimization, CDN integration
- **Purchase:** https://wp-rocket.me

**Option B: W3 Total Cache (FREE)**
- **Installation:** Plugins → Add New → Search "W3 Total Cache"
- **Features:** Page caching, minification, CDN support
- **Setup:** More complex configuration

**Configuration:**
- Enable page caching
- Enable database caching
- Enable object caching
- Configure CDN (if using)

**Premium Alternative:** WP Rocket ($59/year) - Easiest and best

---

### 11. **UpdraftPlus** (FREE)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Purpose:** Automated backups

**Installation:**
1. Go to **Plugins → Add New**
2. Search "UpdraftPlus"
3. Install and activate

**Configuration:**
- Set up automatic backups (daily recommended)
- Configure backup storage (Google Drive, Dropbox, etc.)
- Test restore process

**Premium Alternative:** UpdraftPlus Premium ($70/year) - More storage options

---

## 🔐 PHASE 7: Security

### 12. **Wordfence Security** (FREE)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL  
**Purpose:** Security and malware protection

**Installation:**
1. Go to **Plugins → Add New**
2. Search "Wordfence Security"
3. Install and activate
4. Run setup wizard

**Configuration:**
- Enable firewall
- Set up 2FA for admin accounts
- Configure scan schedule (daily)
- Enable login security

**Premium Alternative:** Wordfence Premium ($99/year) - Real-time threat defense

---

## 📊 PHASE 8: Analytics & Tracking

### 13. **Google Analytics for WordPress by MonsterInsights** (FREE)
**Priority:** ⭐⭐⭐ MEDIUM  
**Purpose:** Website analytics

**Installation:**
1. Go to **Plugins → Add New**
2. Search "MonsterInsights"
3. Install and activate
4. Connect Google Analytics account

**Configuration:**
- Connect to Google Analytics
- Enable eCommerce tracking (for WooCommerce)
- Set up event tracking
- Track food truck location clicks

**Premium Alternative:** MonsterInsights Pro ($99/year) - Advanced tracking

---

## 🎨 PHASE 9: Page Builder (Optional)

### 14. **Elementor** (FREE)
**Priority:** ⭐⭐⭐ MEDIUM  
**Purpose:** Drag-and-drop page builder

**Installation:**
1. Go to **Plugins → Add New**
2. Search "Elementor"
3. Install and activate

**Configuration:**
- Use for custom page layouts
- Create custom templates
- Works great with Astra theme
- Build food menu displays

**Premium Alternative:** Elementor Pro ($59/year) - More widgets and features

---

## 📝 Installation Checklist

### Phase 1: Foundation
- [ ] Install WooCommerce
- [ ] Configure WooCommerce (Knoxville, TN location)
- [ ] Install Contact Form 7 or WPForms
- [ ] Install SEO plugin (Yoast or Rank Math)

### Phase 2: Payment
- [ ] Install Square for WooCommerce
- [ ] Connect Square account (see `square-payment-setup.md`)
- [ ] Configure Square settings
- [ ] Test payment processing

### Phase 3: Location Features
- [ ] Install Google Maps plugin
- [ ] Get Google Maps API key
- [ ] Configure location display (Knoxville area)
- [ ] Install Events Calendar (optional)

### Phase 4: Media
- [ ] Install image optimization plugin
- [ ] Install YouTube embed plugin (if needed)

### Phase 5: Membership
- [ ] Install membership plugin (if using recipes section)
- [ ] Configure membership levels
- [ ] Set up Square payment integration

### Phase 6: Performance
- [ ] Install caching plugin
- [ ] Configure caching settings
- [ ] Install backup plugin
- [ ] Set up automated backups

### Phase 7: Security
- [ ] Install security plugin
- [ ] Configure firewall
- [ ] Set up 2FA

### Phase 8: Analytics
- [ ] Install analytics plugin
- [ ] Connect Google Analytics

---

## 💰 Cost Summary

### Free Setup (Minimum):
- WooCommerce: FREE
- Contact Form 7: FREE
- Yoast SEO: FREE
- Square for WooCommerce: FREE
- Google Maps Widget: FREE
- The Events Calendar: FREE
- Smush: FREE
- W3 Total Cache: FREE
- UpdraftPlus: FREE
- Wordfence: FREE
- MonsterInsights: FREE
- **Total: $0/year**

### Recommended Premium Setup:
- WP Rocket: $59/year
- WPForms Pro: $39.50/year (optional)
- ShortPixel: $9.99/year
- **Total: ~$69-109/year**

### Full Premium Setup:
- WP Rocket: $59/year
- WPForms Pro: $39.50/year
- MemberPress: $149/year
- WP Google Maps Pro: $39/year
- **Total: ~$287/year**

---

## ⚙️ Plugin Settings Quick Reference

### WooCommerce
- **Settings → General:** Knoxville, TN address
- **Settings → Products:** Enable reviews, stock management
- **Settings → Shipping:** Configure zones (Knoxville area)
- **Settings → Payments:** Square (see `square-payment-setup.md`)
- **Settings → Advanced:** Set up permalinks

### Square for WooCommerce
- **WooCommerce → Settings → Payments → Square:**
  - Connect Square account
  - Enable Square payment
  - Configure transaction settings
  - Test mode → Production mode

### Contact Form 7
- **Contact → Contact Forms:** Create forms
- Use shortcodes: `[contact-form-7 id="123"]`

### Yoast SEO
- **SEO → General:** Run setup wizard
- **SEO → Search Appearance:** Configure meta tags
- **SEO → Local SEO:** Add Knoxville, TN business info
- **SEO → XML Sitemaps:** Enable sitemap

### The Events Calendar
- **Events → Settings:** Configure timezone (Eastern)
- **Events → Add New:** Create food truck location events
- Link to custom post type locations

### Wordfence
- **Wordfence → Dashboard:** Run scan
- **Wordfence → Firewall:** Enable firewall
- **Wordfence → Login Security:** Enable 2FA

---

## 🆘 Troubleshooting

### Plugin Conflicts:
- Deactivate all plugins
- Activate one by one to find conflict
- Check error logs

### Square Payment Issues:
- Verify Square account is connected
- Check API credentials
- Enable test mode for testing
- See `square-payment-setup.md` for detailed troubleshooting

### Performance Issues:
- Enable caching
- Optimize images
- Use CDN
- Limit active plugins

### Location/Maps Issues:
- Verify Google Maps API key
- Check API restrictions
- Enable Maps JavaScript API
- Test on mobile devices

---

## 📚 Additional Resources

- **WooCommerce Docs:** https://woocommerce.com/documentation/
- **Square for WooCommerce:** https://woocommerce.com/document/woocommerce-square/
- **Plugin Documentation:** Check each plugin's official docs
- **WordPress Support:** https://wordpress.org/support/

---

## 🎯 Knoxville-Specific Considerations

### Local SEO:
- Add Knoxville, TN to all location data
- Use local keywords: "Creole food truck Knoxville"
- Set up Google Business Profile
- Get local reviews

### Delivery Zones:
- Configure shipping zones for Knoxville area
- Set delivery radius (e.g., 10 miles from downtown)
- Different rates for different zones

### Events:
- Link to Knoxville events calendar
- Partner with local venues
- Market to UT Knoxville area

---

**Next Steps:**
1. Follow installation order above
2. Configure Square payment (see `square-payment-setup.md`)
3. Import products using `sample-products.csv`
4. Set up forms using `form-templates/`
5. Configure locations using `food-truck-location-setup.md`
