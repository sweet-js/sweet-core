# Form Templates

This folder contains form templates for your WordPress site.

## Files

### 1. `catering-inquiry-form.json`
Complete catering inquiry form with all necessary fields:
- Contact information (name, email, phone)
- Event details (date, type, guest count)
- Meal preferences
- Dietary requirements
- Special requests

### 2. `contact-form.json`
Basic contact form for general inquiries:
- Name, email, phone
- Subject dropdown
- Message field

## Usage

### For WPForms:

1. **Install WPForms plugin** (free or premium)
2. Go to **WPForms → Add New**
3. Choose "Blank Form" or use template
4. Use the JSON structure to recreate fields:
   - Add fields matching the JSON structure
   - Configure settings as specified
   - Set up notifications

### For Contact Form 7:

1. **Install Contact Form 7 plugin**
2. Go to **Contact → Add New**
3. Copy the `contact_form_7_version` section from JSON
4. Paste into the form editor
5. Configure mail settings using the `mail` and `mail_2` sections

## Field Descriptions

### Catering Inquiry Form Fields:

1. **Full Name** - Customer's full name
2. **Email Address** - Contact email
3. **Phone Number** - Contact phone
4. **Event Date** - When the event will occur
5. **Event Type** - Dropdown (Corporate, Wedding, etc.)
6. **Number of Guests** - How many people (10-500)
7. **Meal Type** - Breakfast, Lunch, Dinner, etc.
8. **Budget Range** - Optional budget selection
9. **Event Location** - Full address
10. **Dietary Requirements** - Checkboxes for special diets
11. **Special Requests** - Additional information

### Contact Form Fields:

1. **Name** - Customer name
2. **Email** - Contact email
3. **Phone** - Optional phone number
4. **Subject** - Inquiry type dropdown
5. **Message** - Message content

## Customization

### Adding Fields:
- Add new field objects to the `fields` array
- Update notification messages to include new fields
- Use field IDs in notification templates: `{field_id="X"}`

### Changing Options:
- Modify `choices` arrays in select/checkbox fields
- Update placeholder text
- Adjust validation rules (required, min, max)

### Email Notifications:
- Update `notification_email` to change recipient
- Modify `notification_subject` and `notification_message`
- Use field placeholders: `{field_id="1"}` for WPForms or `[field-name]` for Contact Form 7

## Testing

After creating forms:

1. **Test form submission** - Submit test entries
2. **Check email delivery** - Verify admin receives notifications
3. **Test auto-reply** - Verify customer receives confirmation
4. **Mobile testing** - Ensure forms work on mobile devices
5. **Validation testing** - Test required fields and validation

## Integration

### Add to Pages:

**WPForms:**
- Use shortcode: `[wpforms id="FORM_ID"]`
- Or use block: Add "WPForms" block in Gutenberg

**Contact Form 7:**
- Use shortcode: `[contact-form-7 id="FORM_ID"]`
- Or use block: Add "Contact Form 7" block in Gutenberg

### Page Placement:

- **Catering Form:** Add to Catering page
- **Contact Form:** Add to Contact page and footer (optional)

## Security

- Enable **reCAPTCHA** or **honeypot** spam protection
- Use **Akismet** plugin for additional spam filtering
- Regularly update form plugins
- Don't expose form IDs in public code

## Support

- **WPForms Docs:** https://wpforms.com/docs/
- **Contact Form 7 Docs:** https://contactform7.com/docs/
