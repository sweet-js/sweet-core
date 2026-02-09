# Quick Start Guide - WordPress Setup
## Sweet 'n Sassy Food Truck & Catering

---

## 🚀 Setup Order

Follow these steps in order for best results:

### 1. **Theme Setup** (15 minutes)
- [ ] Install **Astra** theme
- [ ] Follow `THEME_CONFIGURATION_PLAN.md`
- [ ] Add `custom-style.css` to Appearance → Customize → Additional CSS
- [ ] Add `functions.php` code to your theme's functions.php (use child theme!)

### 2. **Essential Plugins** (30 minutes)
- [ ] Install **WooCommerce** (run setup wizard)
- [ ] Install **Contact Form 7** or **WPForms**
- [ ] Install **Yoast SEO** or **Rank Math**
- [ ] Follow `PLUGIN_SETUP_GUIDE.md` for full plugin list

### 3. **WooCommerce Configuration** (20 minutes)
- [ ] Configure store settings (see `woocommerce-config.json`)
- [ ] Set up payment gateways (Stripe, PayPal)
- [ ] Configure shipping zones (pickup, delivery)
- [ ] Create product categories

### 4. **Import Products** (15 minutes)
- [ ] Go to **WooCommerce → Products → Import**
- [ ] Upload `sample-products.csv`
- [ ] Map columns and import
- [ ] Assign images from `../wordpress-assets/food-photos/`

### 5. **Create Forms** (15 minutes)
- [ ] Create catering form (use `form-templates/catering-inquiry-form.json`)
- [ ] Create contact form (use `form-templates/contact-form.json`)
- [ ] Add forms to pages

### 6. **Create Pages** (30 minutes)
- [ ] Follow `SITE_STRUCTURE.md`
- [ ] Create all 7 pages:
  - Home
  - Menu
  - Catering
  - Locations
  - Recipes
  - About
  - Contact

### 7. **Set Up Locations** (20 minutes)
- [ ] Follow `location-tracker-setup.md`
- [ ] Create first location entry
- [ ] Set up Google Maps (if using map view)
- [ ] Add locations shortcode to Locations page

### 8. **Upload Images** (15 minutes)
- [ ] Upload all images from `../wordpress-assets/` to Media Library
- [ ] Set logo in Appearance → Customize → Site Identity
- [ ] Set favicon
- [ ] Assign product images

### 9. **Final Configuration** (15 minutes)
- [ ] Set up menus (Primary, Footer)
- [ ] Configure SEO settings
- [ ] Set up email notifications
- [ ] Test forms and ordering

### 10. **Testing** (30 minutes)
- [ ] Test ordering process end-to-end
- [ ] Test forms
- [ ] Test mobile responsiveness
- [ ] Check all links
- [ ] Verify images load correctly

**Total Time: ~3 hours**

---

## 📁 File Reference

### Configuration Files:
- `THEME_CONFIGURATION_PLAN.md` - Theme setup instructions
- `PLUGIN_SETUP_GUIDE.md` - Plugin installation guide
- `woocommerce-config.json` - WooCommerce settings
- `SITE_STRUCTURE.md` - Page structure and content

### Code Files:
- `custom-style.css` - Custom styling (add to Additional CSS)
- `functions.php` - Custom functions (add to theme functions.php)

### Data Files:
- `sample-products.csv` - Product import file
- `form-templates/` - Form templates (WPForms/Contact Form 7)

### Setup Guides:
- `location-tracker-setup.md` - Location tracker instructions
- `README.md` - Detailed documentation

---

## 🎯 Key Settings Quick Reference

### WooCommerce:
- **Currency:** USD ($)
- **Payment:** Stripe + PayPal
- **Shipping:** Local Pickup (free) + Delivery ($8)
- **Tax:** Configure based on location

### Theme Colors:
- **Primary:** #D4A574 (Warm Gold)
- **Secondary:** #8B4513 (Saddle Brown)
- **Accent:** #FF6B35 (Vibrant Orange)

### Image Sizes:
- Menu items: 400x400px
- Hero: 1920x800px
- Gallery: 1920x1080px

---

## ⚠️ Important Notes

1. **Always use a child theme** for custom code
2. **Backup before making changes**
3. **Test in staging first** (if possible)
4. **Enable SSL** before accepting payments
5. **Keep plugins updated** for security

---

## 🆘 Common Issues

### Custom Post Type Not Showing
- Go to Settings → Permalinks → Save Changes

### Images Not Displaying
- Regenerate thumbnails
- Check image paths
- Verify images uploaded to Media Library

### Forms Not Working
- Check plugin is activated
- Verify email settings
- Test spam filters

### Map Not Showing
- Verify Google Maps API key
- Check API restrictions
- Enable Maps JavaScript API

---

## 📞 Next Steps After Setup

1. **Content:** Write page content, product descriptions
2. **SEO:** Optimize meta descriptions, add alt text
3. **Analytics:** Set up Google Analytics
4. **Backup:** Configure automated backups
5. **Security:** Set up security plugin, enable 2FA
6. **Performance:** Enable caching, optimize images
7. **Testing:** Test on multiple devices and browsers
8. **Launch:** Go live!

---

## 📚 Documentation

- **WordPress:** https://wordpress.org/documentation/
- **WooCommerce:** https://woocommerce.com/documentation/
- **Astra Theme:** https://wpastra.com/docs/
- **Contact Form 7:** https://contactform7.com/docs/

---

**Need Help?** Refer to individual documentation files for detailed instructions.
