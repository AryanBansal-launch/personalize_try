# Complete Setup Guide - Step by Step

Follow these steps **in order** to set up your Contentstack Personalize demo.

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ All environment variables set in `.env.local`
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install`)

---

## Step 1: Install Dependencies

```bash
cd personalize
npm install
```

**What this does**: Installs all required packages including Contentstack SDKs.

---

## Step 2: Run Content Setup Script

```bash
npm run setup:content
```

**What this does**:
- Creates the `personalized_content` content type
- Creates 3 sample entries
- Publishes everything to your environment

**Expected output**:
- ✅ Content type created
- ✅ Content type published
- ✅ 3 entries created and published
- ✅ Verification successful

**Note**: If you see "already exists" messages, that's fine - the script will continue.

**After this step**: You should see entries in Contentstack Dashboard → Content → Personalized Content


---

## Step 3: Verify in Contentstack Dashboard (UI)

1. **Go to Contentstack Dashboard**: https://app.contentstack.com
2. **Navigate to**: Content → Your Stack → Content
3. **Verify**:
   - You see "Personalized Content" content type
   - You see 3 entries:
     - Welcome to Our Platform
     - Welcome US Users
     - Welcome UK Users

**✅ Checkpoint**: If you see the entries, proceed to Step 4.

---

## Step 4: Set Up Personalize Project (UI)

1. **Go to**: Personalize → Create Project (or select existing project)
2. **If creating new project**:
   - Enter project name (e.g., "Personalize Demo")
   - Connect it to your stack
   - Copy the **Project UID** from Settings → General → Project Details
3. **Add Project UID to `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid_here
   ```
4. **Save** the `.env.local` file

**✅ Checkpoint**: You have a Personalize project connected to your stack.

---

## Step 5: Create Attributes in Personalize Dashboard (UI)

![Create Attributes in Personalize Dashboard](/public/images/attribute.png)

1. **Go to**: Personalize → Your Project → Attributes
2. **Create Attribute 1 - Location**:
   - Click "Create Attribute" or "New Attribute"
   - **Name (required)**: `location`
   - **Key (required)**: `location` (must match the name, lowercase, no spaces)
     - The Key is the identifier used in your code
     - In your code (`app/page.tsx`), you use `location` as the attribute key
     - This Key will be used when setting attributes: `{ location: selectedLocation }`
   - **Description** (optional): "User's location for personalization"
   - Click "Create"

**Important Notes**:
- The **Key** field is required and must be filled in (you'll see an error if it's empty)
- The Key should be lowercase, no spaces (use camelCase if needed)
- The Key must exactly match what you use in your code when setting attributes
- In your code, you set attributes as: `{ location: 'us' }`
- So the Key in Personalize should be: `location` (not `selectedLocation`)
- The dropdown values (like `'us'`, `'uk'`) are the attribute **values**, not the keys

**✅ Checkpoint**: You have 1 attribute created (location) with its key set.

---

## Step 6: Create Audiences in Personalize Dashboard (UI)

Audiences define user segments based on attribute conditions. You'll use these when creating experiences.

![Create Audiences in Personalize Dashboard](/public/images/audience.png)

1. **Go to**: Personalize → Your Project → Audiences
2. **Create Audience 1 - US Location Audience**:
   - Click "Create Audience" or "New Audience"
   - **Name**: "US Users"
   - **Description** (optional): "Users located in the United States"
   - **Add Condition**:
     - **Attribute**: Select `location` (the Key you created)
     - **Operator**: `equals`
     - **Value**: `us`
   - Click "Create" or "Save"
3. **Create Audience 2 - UK Location Audience**:
   - Click "Create Audience"
   - **Name**: "UK Users"
   - **Add Condition**:
     - **Attribute**: `location`
     - **Operator**: `equals`
     - **Value**: `uk`
   - Click "Create"

**Important Notes**:
- Audiences are reusable - you can use the same audience in multiple experiences
- You can combine multiple conditions in one audience if needed
- The attribute values must match exactly what you use in your code dropdowns

**✅ Checkpoint**: You have audiences created for your user segments.

---

## Step 7: Run Personalize Variants Setup Script (Optional)

```bash
npm run setup:personalize
```

**What this does**:
- Fetches your existing entries
- Displays variant configuration information
- Provides guidance on creating variants

**Expected output**:
- ✅ Found X entries
- ℹ️  Variant information displayed for location-based variants

**Important Note**: 
- Entry variants are **NOT created by this script**
- Variants are created automatically when you create experiences in Personalize Dashboard (Step 8)
- This script just provides information about what variants you should create

---

## Step 8: Create Experiences in Personalize Dashboard (UI)

**Important**: Entry variants are created automatically when you create experiences. You don't need to create variants separately.

![Create Experiences in Personalize Dashboard](/public/images/experience.png)

1. **Go to**: Personalize → Your Project → Experiences
2. **Create Experience 1 - Location Experience (US)**:
   - Click "Create Experience" or "New Experience"
   - **Name**: "Location-based Personalization - US"
   - **Select Entry**: Choose "Welcome to Our Platform" (or your base entry)
   - **Add Audience** (you can use the audience you created OR add conditions directly):
     - **Option A**: Select "US Users" audience (the one you created in Step 6 - Audiences)
     - **Option B**: Add condition directly:
       - **Attribute**: Select `location` from dropdown (this is the Key you created)
       - **Operator**: `equals`
       - **Value**: `us`
   - **Create Variant** (this is where the entry variant gets created):
     - Click "Create Variant" or "Add Variant"
     - **Variant Name**: "US Location Variant"
     - **Customize Content**: Update the entry fields (title, description, content, etc.) with US-specific content
     - The variant is created automatically when you customize the content
     - ![Create Variants in Experience](/public/images/variant.png)
     -![Create variant Entries in Contentstack Dashboard](/public/images/entry.png)
   - **Save and Publish** the experience
3. **Create Experience 2 - Location Experience (UK)**:
   - Click "Create Experience"
   - **Name**: "Location-based Personalization - UK"
   - **Select Entry**: Same entry as above
   - **Add Audience**: Select "UK Users" audience (or add condition: `location` equals `uk`)
   - **Create Variant**: Customize with UK-specific content
   - **Save and Publish**
4. **Repeat** for other location audiences if desired

**Key Points**:
- You can use pre-created audiences OR add conditions directly in the experience
- Using audiences makes it easier to reuse the same segment across multiple experiences
- Variants are created automatically when you customize content in an experience
- Each experience can have multiple variants for different audience conditions
- You can create multiple experiences targeting the same entry with different conditions
- When you publish an experience, all its variants are published automatically

**✅ Checkpoint**: You have at least one experience with a variant created and published.

---

## Step 9: Update Your App Code

1. **Open**: `app/page.tsx`
2. **Find** (around line 65-66):
   ```typescript
   const contentTypeUid = 'content_type_uid'; // Update this
   const entryUid = 'entry_uid'; // Update this
   ```
3. **Replace with**:
   ```typescript
   const contentTypeUid = 'personalized_content';
   const entryUid = '<one of your entry UIDs>'; // Use the "Welcome to Our Platform" entry UID
   ```
4. **To find entry UID**:
   - Go to Contentstack Dashboard → Content → Personalized Content
   - Click on "Welcome to Our Platform" entry
   - Copy the UID from the URL or entry details

**✅ Checkpoint**: Your code is pointing to the correct content type and entry.

---

## Step 10: Start Your Development Server

```bash
npm run dev
```

**What this does**: Starts your Next.js app on http://localhost:3000

**Expected**: App should load without errors.

---

## Step 11: Test Personalization

1. **Open**: http://localhost:3000
2. **You should see**:
   - A dropdown for Location
   - Content displayed below
3. **Test different selections**:
   - Select "United States" → Should show US-specific content
   - Select "United Kingdom" → Should show UK-specific content
   - Select "Default" → Should show base entry content
4. **Check browser console** (F12):
   - Should see "Active Experiences" logged
   - Should see "Variant Aliases" logged
   - Should see variant information displayed

**✅ Checkpoint**: Personalization is working! Content changes based on dropdown selections.

---

## Troubleshooting

### Issue: "Entry not found"
- **Solution**: Make sure you updated `entryUid` in `app/page.tsx` with a valid UID

### Issue: "Personalize Project UID is not configured"
- **Solution**: Add `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` to `.env.local` and restart dev server

### Issue: "No variant matched"
- **Solution**: 
  - Check that experiences are created and published in Personalize Dashboard
  - Verify audiences are created and conditions match your attribute values
  - Verify attribute **Keys** match what you're using in your code (check `app/page.tsx`)
  - Verify attribute values match the values in your dropdowns (case-sensitive)
  - Make sure audiences in experiences match the attribute values you're sending
  - Ensure the attribute Key in Personalize matches: `location` (not `selectedLocation`)
  - Check that the audience conditions use the exact same values as your dropdowns (e.g., `'us'`, `'uk'`)

### Issue: Variants not created by script
- **Solution**: Create variants manually in Contentstack Dashboard:
  - Go to Content → Entry → Variants tab
  - Create variants manually
  - Link them to experiences in Personalize Dashboard

### Issue: Content doesn't change when selecting dropdowns
- **Solution**:
  - Check browser console for errors
  - Verify Personalize SDK is initialized correctly
  - Check that variant aliases are being passed to Content Delivery API
  - Verify experiences are active and published

---

## Quick Reference: All Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup content
npm run setup:content

# 3. Setup personalize variants
npm run setup:personalize

# 4. Start dev server
npm run dev
```

---

## Summary Checklist

- [ ] Dependencies installed
- [ ] Content setup script run successfully
- [ ] Entries visible in Contentstack Dashboard
- [ ] Personalize project created and connected
- [ ] Attributes created (location) with Key set
- [ ] Audiences created (US Users, UK Users, etc.)
- [ ] Personalize variants setup script run (optional - for information)
- [ ] Experiences created in Personalize Dashboard
- [ ] Variants created automatically when customizing experiences
- [ ] Experiences published
- [ ] App code updated with correct UIDs
- [ ] Dev server running
- [ ] Personalization working in browser

---

## Next Steps After Setup

Once everything is working:
1. Customize the content in your entries
2. Add more attributes (e.g., device, interests)
3. Create more experiences for different user segments
4. Test with real user data
5. Deploy to production

---

**Need Help?** Check the console logs and browser developer tools for detailed error messages.

