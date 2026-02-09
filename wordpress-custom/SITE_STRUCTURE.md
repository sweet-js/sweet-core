# WordPress Site Structure
## Sweet 'n Sassy Food Truck & Catering

---

## 📄 Required Pages

### 1. **HOME** (Front Page)
**Purpose:** First impression, showcase business, drive actions

**Content Sections:**
- Hero section with food truck image (`hero/foodtruck.jpeg`)
- Featured menu items (3-5 items with photos from `food-photos/`)
- "Find Us" section with location tracker
- About preview (brief intro)
- Call-to-action buttons:
  - "View Full Menu" → Menu page
  - "Order Online" → WooCommerce shop
  - "Book Catering" → Catering page
  - "Find Food Truck" → Locations page

**Recommended Layout:**
```
[Hero Image]
[Featured Menu Items Grid - 3 columns]
[Food Truck Location Tracker Widget]
[About Preview Section]
[Call-to-Action Buttons]
[Social Media Links]
```

**Images to Use:**
- Hero: `hero/foodtruck.jpeg`
- Featured items: Select best 3-5 from `food-photos/`

---

### 2. **MENU** (Menu Showcase)
**Purpose:** Display all menu items with photos and prices

**Content Sections:**
- Menu image (`menu/Food truck menu Custom Private.1.jpg`)
- WooCommerce product categories:
  - Appetizers
  - Entrees
  - Sides
  - Desserts
  - Drinks
- Each product should have:
  - High-quality food photo
  - Name
  - Description
  - Price
  - "Add to Cart" button
- Online ordering integration

**Recommended Layout:**
```
[Page Header with Menu Image]
[Category Filters/Tabs]
[Product Grid - 3 columns]
[Each Product Card with Image, Title, Description, Price, Add to Cart]
```

**Images to Use:**
- Menu display: `menu/Food truck menu Custom Private.1.jpg`
- Product images: Assign from `food-photos/` to specific menu items

**WooCommerce Setup:**
- Create products for each menu item
- Assign product categories
- Set featured images from `food-photos/`
- Configure pricing and inventory

---

### 3. **CATERING** (Catering Services)
**Purpose:** Catering inquiry form and service information

**Content Sections:**
- Hero section with catering-focused image
- Service offerings:
  - Event types (weddings, corporate, parties)
  - Package options
  - Sample menus
- Catering inquiry form (Contact Form 7 or WPForms):
  - Name
  - Email
  - Phone
  - Event date
  - Event type
  - Number of guests
  - Special requests
- Pricing information (if applicable)
- Testimonials/reviews

**Recommended Layout:**
```
[Hero Section]
[Service Offerings - Grid Layout]
[Catering Packages/Options]
[Inquiry Form]
[Testimonials]
[Contact Information]
```

**Form Fields:**
- Name (required)
- Email (required)
- Phone (required)
- Event Date (date picker)
- Event Type (dropdown)
- Number of Guests (number)
- Location/Venue (text)
- Special Dietary Requirements (textarea)
- Additional Notes (textarea)

**Images to Use:**
- Hero: Use a food photo from `food-photos/` that shows catering setup
- Gallery: Showcase catering events (if available)

---

### 4. **LOCATIONS** (Food Truck Schedule/Tracker)
**Purpose:** Display food truck schedule and real-time location

**Content Sections:**
- Interactive map (Google Maps)
- Upcoming locations list:
  - Date
  - Time (start - end)
  - Address
  - Map pin
- Current location indicator (if truck is out)
- Schedule by day/week/month view
- "Get Directions" buttons

**Recommended Layout:**
```
[Page Header: "Find Our Food Truck"]
[Interactive Map - Full Width]
[Upcoming Locations List - Sidebar or Below Map]
[Each Location Card: Date, Time, Address, Map Link]
[Schedule Calendar View (Optional)]
```

**Custom Post Type Usage:**
- Use "Food Truck Locations" custom post type
- Each location entry includes:
  - Title: Location name/event name
  - Date: Event date
  - Start Time: When truck arrives
  - End Time: When truck leaves
  - Address: Full address
  - Latitude/Longitude: For map pin
  - Phone: Optional contact number

**Map Integration:**
- Google Maps API
- Display all upcoming locations as markers
- Click marker to show details
- "Get Directions" opens Google Maps navigation

**Images to Use:**
- Location images: `hero/rear2.jpeg` or location-specific photos

---

### 5. **RECIPES & TIPS** (YouTube Videos - Membership Area)
**Purpose:** Exclusive recipe content for members

**Content Sections:**
- Membership login/registration
- Video gallery (YouTube embeds)
- Recipe cards with:
  - Video embed
  - Recipe name
  - Description
  - Ingredients list
  - Instructions
  - Tips/notes
- Categories:
  - Appetizers
  - Main Courses
  - Desserts
  - Cooking Tips
  - Behind-the-Scenes

**Recommended Layout:**
```
[Membership Login/Register Section]
[Video Gallery Grid]
[Each Recipe Card: Thumbnail, Title, Description, "Watch Video" Button]
[Recipe Detail Page: Video, Full Recipe, Ingredients, Instructions]
```

**Membership Integration:**
- Use MemberPress or Paid Memberships Pro
- Free tier: Limited videos
- Paid tier: Full access to all recipes
- YouTube integration: Embed videos or use YouTube API

**Content Structure:**
- Create posts/pages for each recipe
- Embed YouTube videos
- Add recipe details below video
- Use categories/tags for organization

**Images to Use:**
- Video thumbnails: YouTube auto-generates
- Recipe photos: Use from `food-photos/` if available

---

### 6. **ABOUT** (Our Story)
**Purpose:** Tell the business story, build connection

**Content Sections:**
- Business story/history
- Mission statement
- Owner/chef bio
- Food philosophy
- Why we started
- Community involvement
- Photo gallery (behind-the-scenes)

**Recommended Layout:**
```
[Hero Section with Owner Photo]
[Our Story - Text Content]
[Mission Statement - Highlighted Box]
[Owner/Chef Bio]
[Photo Gallery]
[Contact Information]
```

**Images to Use:**
- Hero: Owner photo or food truck image
- Gallery: Behind-the-scenes photos, food prep, events

---

### 7. **CONTACT** (Get in Touch)
**Purpose:** Multiple ways to contact the business

**Content Sections:**
- Contact form:
  - Name
  - Email
  - Phone
  - Subject
  - Message
- Contact information:
  - Phone number
  - Email address
  - Social media links
- Business hours
- Location (if applicable)
- Map (if physical location)

**Recommended Layout:**
```
[Page Header]
[Contact Form - Left Side]
[Contact Information - Right Side]
[Business Hours]
[Social Media Links]
[Map (if applicable)]
```

**Form Fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Subject (dropdown: General, Catering, Feedback, Other)
- Message (textarea, required)

---

## 🗂️ Menu Structure

### **Primary Navigation Menu:**
```
Home | Menu | Catering | Locations | Recipes | About | Contact
```

### **Footer Menu:**
```
Privacy Policy | Terms of Service | Sitemap | Accessibility
```

---

## 📱 Mobile Considerations

All pages should be:
- ✅ Mobile-responsive
- ✅ Fast-loading (optimized images)
- ✅ Easy navigation (hamburger menu)
- ✅ Touch-friendly buttons
- ✅ Readable text sizes
- ✅ Accessible forms

---

## 🛒 WooCommerce Product Categories

### **Main Categories:**
1. **Appetizers**
   - Subcategories (if needed)
   - Products with photos

2. **Entrees**
   - Main dishes
   - Combo meals

3. **Sides**
   - Side dishes
   - Extras

4. **Desserts**
   - Sweet treats
   - Beverages (dessert drinks)

5. **Drinks**
   - Beverages
   - Specialty drinks

6. **Catering Packages**
   - Small events (10-25 people)
   - Medium events (26-50 people)
   - Large events (51-100 people)
   - Custom packages

---

## 📊 Content Strategy

### **Homepage:**
- Update featured items weekly
- Rotate hero images monthly
- Show current/upcoming locations

### **Menu Page:**
- Keep prices updated
- Add seasonal items
- Update photos regularly

### **Locations Page:**
- Update schedule weekly/monthly
- Mark current location prominently
- Archive past locations

### **Recipes Page:**
- Add new recipe weekly/bi-weekly
- Engage with member comments
- Create themed recipe collections

---

## 🔗 Internal Linking Strategy

- Home → Links to all main pages
- Menu → Links to Catering, Locations
- Catering → Links to Menu, Contact
- Locations → Links to Menu, Contact
- Recipes → Links to Menu (for ingredients)
- About → Links to Menu, Locations
- Contact → Links to all pages

---

## 📝 SEO Considerations

### **Page Titles:**
- Home: "Sweet 'n Sassy | Food Truck & Catering | [City]"
- Menu: "Menu | Sweet 'n Sassy Food Truck"
- Catering: "Catering Services | Sweet 'n Sassy"
- Locations: "Food Truck Schedule & Locations | Sweet 'n Sassy"
- Recipes: "Exclusive Recipes & Cooking Tips | Sweet 'n Sassy"
- About: "About Us | Sweet 'n Sassy Food Truck"
- Contact: "Contact Us | Sweet 'n Sassy"

### **Meta Descriptions:**
- Write unique, compelling descriptions for each page
- Include location keywords
- Include call-to-action

### **Schema Markup:**
- Use Restaurant schema for menu items
- Use LocalBusiness schema for contact info
- Use Event schema for food truck locations

---

## ✅ Implementation Checklist

### **Phase 1: Core Pages**
- [ ] Create Home page
- [ ] Create Menu page
- [ ] Create Catering page
- [ ] Create Locations page
- [ ] Create Recipes page
- [ ] Create About page
- [ ] Create Contact page

### **Phase 2: WooCommerce Setup**
- [ ] Install WooCommerce
- [ ] Create product categories
- [ ] Add products with images
- [ ] Configure payment methods
- [ ] Set up shipping (if applicable)
- [ ] Test ordering flow

### **Phase 3: Custom Features**
- [ ] Set up Food Truck Locations custom post type
- [ ] Create location entries
- [ ] Integrate Google Maps
- [ ] Set up membership area
- [ ] Configure YouTube integration

### **Phase 4: Content & Images**
- [ ] Upload all optimized images
- [ ] Assign images to pages/products
- [ ] Write page content
- [ ] Add product descriptions
- [ ] Create forms

### **Phase 5: Testing**
- [ ] Test all forms
- [ ] Test mobile responsiveness
- [ ] Test ordering process
- [ ] Test location tracker
- [ ] Test membership area
- [ ] Check page load speeds

---

## 🎯 Next Steps

1. **Install WordPress Theme** (Astra recommended)
2. **Create all pages** using the structure above
3. **Set up WooCommerce** and add products
4. **Configure custom post types** for locations
5. **Add custom CSS** from `custom-style.css`
6. **Add functions.php code** from `functions.php`
7. **Upload and assign images** from `wordpress-assets/`
8. **Configure forms** (Contact Form 7 or WPForms)
9. **Set up Google Maps** API for location tracker
10. **Configure membership plugin** for recipes section
11. **Test everything** on mobile and desktop
12. **Launch!**

---

**Need Help?** Refer to:
- `THEME_CONFIGURATION_PLAN.md` for theme setup
- `custom-style.css` for styling
- `functions.php` for functionality
- `wordpress-assets/IMAGE_RECOMMENDATIONS.md` for image usage
