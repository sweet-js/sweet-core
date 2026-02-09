# WordPress Theme Configuration Plan
## Sweet 'n Sassy Food Truck & Catering

---

## 🎯 Recommended Theme: **Astra** (Primary Recommendation)

### Why Astra?
- ✅ **Lightweight:** ~50KB (vs 200KB+ for many themes)
- ✅ **WooCommerce Optimized:** Built-in WooCommerce support and styling
- ✅ **Mobile-First:** Excellent responsive design for on-the-go location checking
- ✅ **Performance:** 95+ PageSpeed score out of the box
- ✅ **Customization:** Extensive customization options without code
- ✅ **Food Industry Ready:** Great for visual content and galleries
- ✅ **Free Version:** Robust free version with premium upgrade available

### Alternative Options:

**GeneratePress** (Second Choice)
- Even lighter (~10KB)
- Excellent performance
- Slightly less customization options in free version

**Neve** (Third Choice)
- Modern, clean design
- Good WooCommerce integration
- Slightly heavier than Astra

---

## 📦 Required Plugins

### Essential Plugins:
1. **WooCommerce** - Online ordering and payments
2. **Astra Starter Sites** (if using Astra) - Pre-built templates
3. **Elementor** or **Gutenberg** - Page builder (Elementor recommended for ease)
4. **Yoast SEO** or **Rank Math** - SEO optimization
5. **WP Rocket** or **W3 Total Cache** - Caching for performance
6. **Smush** or **ShortPixel** - Additional image optimization
7. **Contact Form 7** or **WPForms** - Contact/catering inquiry forms

### Recommended Plugins:
8. **Google Maps Widget** - For food truck location tracker
9. **Event Calendar** (The Events Calendar) - For food truck schedule
10. **YouTube Embed Plus** - For recipe videos
11. **Membership Plugin** (MemberPress or Paid Memberships Pro) - For YouTube recipe membership
12. **Stripe for WooCommerce** - Payment processing
13. **Order Tracking** - For catering orders

---

## 🎨 Theme Setup Steps

### Step 1: Install Astra Theme
1. Go to **Appearance → Themes → Add New**
2. Search for "Astra"
3. Install and activate

### Step 2: Install Astra Starter Sites (Optional)
1. Install "Astra Starter Sites" plugin
2. Choose a food/restaurant template as starting point
3. Import demo content (you can customize later)

### Step 3: Configure Theme Settings

**Appearance → Customize → Site Identity**
- Upload logo: `wordpress-assets/logos/sweetnsassylogo_name_tp.png`
- Upload favicon: `wordpress-assets/favicon/favicon.png`
- Site title: "Sweet 'n Sassy"
- Tagline: "Food Truck & Catering"

**Appearance → Customize → Colors**
- Primary Color: `#D4A574` (Warm Gold)
- Secondary Color: `#8B4513` (Saddle Brown)
- Accent Color: `#FF6B35` (Vibrant Orange)
- Text Color: `#2C2C2C` (Dark Gray)
- Background: `#FFFFFF` (White)

**Appearance → Customize → Typography**
- Body Font: System fonts (Arial/Helvetica) or "Poppins" (Google Fonts)
- Headings Font: "Playfair Display" or "Montserrat" (Google Fonts)
- Base Font Size: 16px
- Line Height: 1.6

**Appearance → Customize → Header**
- Header Layout: Logo + Menu (horizontal)
- Sticky Header: Enabled
- Mobile Menu: Hamburger menu
- Header Background: White with subtle shadow

**Appearance → Customize → Layout**
- Container Width: 1200px
- Content Width: 70% (sidebar 30% for widgets)
- Blog Layout: Grid (for food photos)

---

## 🏗️ Site Structure Setup

### Pages to Create:
1. **Home** (Set as homepage)
2. **Menu** (Showcase menu items)
3. **Catering** (Catering inquiry form)
4. **Locations** (Food truck schedule/tracker)
5. **Recipes & Tips** (YouTube videos - membership area)
6. **About** (Business story)
7. **Contact** (Contact form + info)

### Menus to Create:
**Primary Menu:**
- Home | Menu | Catering | Locations | Recipes | About | Contact

**Footer Menu:**
- Privacy Policy | Terms | Sitemap

---

## 🛒 WooCommerce Setup

### Step 1: Install & Configure WooCommerce
1. Install WooCommerce plugin
2. Run setup wizard
3. Configure:
   - Store location
   - Currency (USD)
   - Payment methods (Stripe, PayPal)
   - Shipping (if applicable)

### Step 2: Product Categories
- Appetizers
- Entrees
- Sides
- Desserts
- Drinks
- Catering Packages

### Step 3: Product Setup
- Use food photos from `wordpress-assets/food-photos/`
- Set featured images for each product
- Add descriptions, prices, ingredients
- Enable "Add to Cart" for online ordering

---

## 📱 Mobile Optimization Checklist

- [ ] Test navigation on mobile devices
- [ ] Ensure food truck location map is mobile-friendly
- [ ] Optimize images for mobile (WordPress auto-generates sizes)
- [ ] Test ordering flow on mobile
- [ ] Ensure contact forms are mobile-optimized
- [ ] Test YouTube video embeds on mobile

---

## ⚡ Performance Optimization

1. **Enable Caching:** WP Rocket or W3 Total Cache
2. **Image Optimization:** Smush or ShortPixel (convert to WebP)
3. **CDN:** Consider Cloudflare (free tier available)
4. **Lazy Loading:** Enable for images (WordPress 5.5+)
5. **Minify CSS/JS:** Use caching plugin features
6. **Database Cleanup:** WP-Optimize plugin

---

## 🔒 Security Setup

1. **WordPress Updates:** Keep core, themes, plugins updated
2. **Security Plugin:** Wordfence or Sucuri
3. **Backup Plugin:** UpdraftPlus or BackupBuddy
4. **SSL Certificate:** Ensure HTTPS is enabled
5. **Strong Passwords:** Use password manager
6. **Two-Factor Auth:** Enable for admin accounts

---

## 📊 SEO Configuration

1. **SEO Plugin:** Install Yoast SEO or Rank Math
2. **XML Sitemap:** Enable in SEO plugin
3. **Schema Markup:** Use schema for restaurant/food business
4. **Local SEO:** Set up Google Business Profile
5. **Meta Descriptions:** Write unique descriptions for each page
6. **Alt Text:** Add descriptive alt text to all images

---

## 🎯 Next Steps After Theme Installation

1. ✅ Install Astra theme
2. ✅ Upload custom CSS (from `custom-style.css`)
3. ✅ Add functions.php code (from `functions.php`)
4. ✅ Create all pages (see SITE_STRUCTURE.md)
5. ✅ Set up WooCommerce products
6. ✅ Configure food truck location tracker
7. ✅ Set up catering inquiry form
8. ✅ Integrate YouTube membership area
9. ✅ Test mobile responsiveness
10. ✅ Optimize performance

---

## 📝 Notes

- **Child Theme:** Consider creating a child theme to preserve customizations
- **Backup First:** Always backup before making major changes
- **Staging Site:** Consider using staging environment for testing
- **Page Builder:** Elementor works great with Astra for easy customization

---

**Theme Download:** https://wordpress.org/themes/astra/  
**Documentation:** https://wpastra.com/docs/  
**Support:** https://wpastra.com/support/
