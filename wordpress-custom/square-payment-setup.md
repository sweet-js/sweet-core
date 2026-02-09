# Square Payment Setup Guide
## Sweet n' Sassy - WooCommerce Integration

**Important:** You already use Square for payments. This guide will help you connect your existing Square account to WooCommerce for online ordering.

---

## 📋 Prerequisites

- ✅ WooCommerce installed and activated
- ✅ Existing Square account (you already have this!)
- ✅ Square for WooCommerce plugin (official, free)

---

## 🚀 Step 1: Install Square for WooCommerce Plugin

### Installation:

1. Go to **WordPress Admin → Plugins → Add New**
2. Search for **"Square for WooCommerce"**
3. **Important:** Make sure you install the **official plugin** by WooCommerce
   - Look for: "Square for WooCommerce" by WooCommerce
   - NOT third-party plugins
4. Click **"Install Now"** then **"Activate"**

### Verify Installation:

- Go to **WooCommerce → Settings → Payments**
- You should see **"Square"** in the list of payment methods

---

## 🔑 Step 2: Get Your Square API Credentials

Since you already use Square, you need to get your API credentials from your Square account.

### Option A: Square Developer Dashboard (Recommended)

1. Go to https://developer.squareup.com/
2. Sign in with your Square account credentials
3. Click **"Applications"** in the left menu
4. Click **"Create Application"** (or use existing if you have one)
5. Fill in:
   - **Application Name:** "Sweet n' Sassy WooCommerce"
   - **Description:** "WooCommerce payment integration"
6. Click **"Create Application"**
7. You'll see your **Application ID** and **Application Secret**
8. Copy these - you'll need them!

### Option B: Square Dashboard (Simpler Method)

1. Go to https://squareup.com/login
2. Sign in to your Square account
3. Go to **Settings → Business → API**
4. If you don't have API access enabled, you may need to:
   - Contact Square support
   - Or use the Developer Dashboard method above

### Get Your Location ID:

1. In Square Dashboard, go to **Settings → Locations**
2. Find your primary location (or the one you want to use)
3. Click on the location
4. Copy the **Location ID** (looks like: `CBASE...` or similar)

---

## ⚙️ Step 3: Configure Square in WooCommerce

### Access Square Settings:

1. Go to **WooCommerce → Settings → Payments**
2. Find **"Square"** in the payment methods list
3. Click **"Manage"** or **"Set up"**

### Enter Your Credentials:

1. **Application ID:** Paste your Application ID from Step 2
2. **Application Secret:** Paste your Application Secret from Step 2
3. **Location ID:** Paste your Location ID from Step 2
4. **Environment:** 
   - Start with **"Sandbox"** for testing
   - Switch to **"Production"** when ready to go live

### Additional Settings:

- **Enable Square:** Check this box
- **Title:** "Square" (or "Credit Card" or "Pay with Square")
- **Description:** "Pay securely with Square - Credit cards, Apple Pay, Google Pay"
- **Transaction Type:**
  - **Charge:** Charges immediately (recommended)
  - **Authorize:** Authorizes now, charges later
- **Enable Logging:** Check this for troubleshooting
- **Sync Square Customers:** Check this to sync customer data
- **Sync Square Products:** Leave unchecked (you manage products in WooCommerce)

### Save Settings:

Click **"Save changes"** at the bottom

---

## 🧪 Step 4: Test Payment Processing

### Test Mode (Sandbox):

1. Make sure **Environment** is set to **"Sandbox"**
2. Go to your website's shop page
3. Add a product to cart
4. Go to checkout
5. Use Square test card numbers:
   - **Card Number:** 4111 1111 1111 1111
   - **Expiration:** Any future date (e.g., 12/25)
   - **CVV:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 37902)
6. Complete the order
7. Check that order appears in WooCommerce

### Verify Test Payment:

- Go to **WooCommerce → Orders**
- You should see the test order
- Order status should be "Processing" or "Completed"
- Payment method should show "Square"

---

## 🚀 Step 5: Switch to Production Mode

Once testing is successful:

1. Go back to **WooCommerce → Settings → Payments → Square**
2. Change **Environment** from **"Sandbox"** to **"Production"**
3. **Important:** Make sure you're using **Production** credentials (not sandbox)
4. Click **"Save changes"**
5. Test with a real, small order ($1-2) to verify

---

## 💳 Step 6: Configure Payment Methods

Square supports multiple payment methods:

### Credit/Debit Cards:
- Automatically enabled
- Visa, Mastercard, American Express, Discover

### Digital Wallets:
- **Apple Pay:** Automatically enabled if customer's device supports it
- **Google Pay:** Automatically enabled if customer's device supports it

### Square Gift Cards:
- Can be enabled in Square settings
- Customers can use Square gift cards at checkout

---

## 📱 Mobile Payment Considerations

### Mobile Optimization:

Square works great on mobile devices:

- **Apple Pay:** Automatically appears on iOS devices
- **Google Pay:** Automatically appears on Android devices
- **Card Entry:** Mobile-friendly card input form
- **Fast Checkout:** Quick payment processing

### Testing Mobile:

1. Test on actual mobile device (not just browser)
2. Test Apple Pay (if you have iPhone)
3. Test Google Pay (if you have Android)
4. Test regular card entry on mobile
5. Verify checkout is smooth and fast

---

## 🔒 Security Best Practices

### SSL Certificate:

- **CRITICAL:** You MUST have SSL (HTTPS) enabled
- Square requires secure connections
- Check that your site URL starts with `https://`
- If not, install SSL certificate (many hosts provide free SSL)

### API Credentials:

- **Never share** your Application Secret
- **Don't commit** credentials to public repositories
- **Rotate credentials** if compromised
- **Use environment variables** if possible (advanced)

### PCI Compliance:

- Square handles all PCI compliance
- You don't store credit card data
- All payments processed securely through Square
- This is one of Square's biggest advantages!

---

## ⚙️ Advanced Settings

### Sync Settings:

- **Sync Square Customers:** 
  - Enabled: Creates Square customer records
  - Useful for customer management in Square
- **Sync Square Products:**
  - Disabled: You manage products in WooCommerce
  - Only enable if you want two-way sync

### Transaction Settings:

- **Charge Type:** 
  - **Charge:** Immediate payment (recommended for food orders)
  - **Authorize:** Hold funds, charge later (for catering deposits)
- **Enable Logging:**
  - Useful for troubleshooting
  - Logs stored in WooCommerce → Status → Logs

### Refund Settings:

- Refunds can be processed through:
  - WooCommerce order page
  - Square Dashboard
  - Both sync automatically

---

## 🆘 Troubleshooting

### Payment Not Processing:

1. **Check SSL:** Site must use HTTPS
2. **Verify Credentials:** Double-check Application ID, Secret, Location ID
3. **Check Environment:** Make sure you're using correct environment (Sandbox vs Production)
4. **Check Logs:** Go to WooCommerce → Status → Logs → Look for "square" logs
5. **Test Connection:** Use Square's test mode first

### Common Errors:

**"Invalid Application ID":**
- Verify Application ID is correct
- Make sure you copied the entire ID

**"Invalid Location ID":**
- Verify Location ID is correct
- Make sure you're using the right location

**"SSL Required":**
- Install SSL certificate
- Ensure site uses HTTPS

**"Payment Failed":**
- Check Square Dashboard for declined transactions
- Verify card details are correct
- Check if card has sufficient funds

### Check Logs:

1. Go to **WooCommerce → Status → Logs**
2. Look for log files starting with "square"
3. Open the most recent log
4. Look for error messages
5. Common log locations:
   - `wp-content/uploads/wc-logs/square-*.log`

---

## 📊 Monitoring Payments

### In WooCommerce:

- **Orders:** WooCommerce → Orders
- See all orders with Square payments
- Process refunds from order page

### In Square Dashboard:

- **Transactions:** Square Dashboard → Transactions
- See all Square transactions
- Process refunds
- View payment details

### Sync:

- Orders sync automatically between WooCommerce and Square
- Refunds sync both ways
- Customer data syncs (if enabled)

---

## 💰 Fees and Pricing

### Square Fees (Standard):

- **In-Person:** 2.6% + $0.10 per transaction
- **Online:** 2.9% + $0.30 per transaction
- **Keyed-In:** 3.5% + $0.15 per transaction

### Your Current Square Plan:

- Check your Square Dashboard for your specific fee structure
- Fees may vary based on your Square plan
- Contact Square if you have questions about fees

---

## ✅ Setup Checklist

- [ ] Square for WooCommerce plugin installed
- [ ] Square account credentials obtained
- [ ] Application ID entered
- [ ] Application Secret entered
- [ ] Location ID entered
- [ ] SSL certificate installed (HTTPS)
- [ ] Test mode configured
- [ ] Test payment completed successfully
- [ ] Production mode enabled
- [ ] Real payment tested
- [ ] Mobile payment tested
- [ ] Logging enabled (for troubleshooting)
- [ ] Customer sync configured (optional)
- [ ] Refund process tested

---

## 📞 Support Resources

### Square Support:

- **Square Help Center:** https://squareup.com/help
- **Square Developer Docs:** https://developer.squareup.com/docs
- **Square Support:** 1-855-700-6000

### WooCommerce Support:

- **WooCommerce Docs:** https://woocommerce.com/document/woocommerce-square/
- **WooCommerce Support:** https://woocommerce.com/support/

### Plugin Support:

- **Square for WooCommerce:** https://wordpress.org/plugins/woocommerce-square/
- **Plugin Support Forum:** https://wordpress.org/support/plugin/woocommerce-square/

---

## 🎯 Next Steps After Setup

1. **Test Thoroughly:**
   - Test with small real orders
   - Test on mobile devices
   - Test refund process

2. **Monitor:**
   - Check orders are processing correctly
   - Monitor Square Dashboard
   - Watch for any errors

3. **Optimize:**
   - Enable Apple Pay/Google Pay
   - Optimize checkout flow
   - Add payment method descriptions

4. **Go Live:**
   - Switch to production mode
   - Announce online ordering
   - Monitor first few orders closely

---

## 💡 Pro Tips

1. **Use Square Terminal:** If you have Square Terminal, you can process online orders through it too
2. **Square Invoices:** You can also create Square invoices for catering orders
3. **Square Appointments:** Consider Square Appointments for catering bookings
4. **Analytics:** Use Square Dashboard analytics to track online vs in-person sales
5. **Customer Management:** Sync customers to build your Square customer database

---

**Important Notes:**

- Square for WooCommerce is the **official** plugin - use this, not third-party plugins
- All payments are processed securely through Square
- You don't handle credit card data - Square does
- PCI compliance is handled by Square
- Refunds can be processed from either WooCommerce or Square Dashboard

**Ready to go live?** Make sure you've tested thoroughly and have SSL enabled!
