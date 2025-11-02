# Gmail SMTP Setup Guide

Your registration is working perfectly! But Gmail is blocking the email login. Follow these steps:

## Option 1: Generate App Password (Recommended) ⭐

### Prerequisites
- Your Gmail account must have **2-Step Verification** enabled

### Steps:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter name: "QuickFile"
   - Click "Generate"
   - **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

3. **Update your .env file**:
   ```env
   SMTP_USER=quickfile97@gmail.com
   SMTP_PASS=abcdefghijklmnop    # <-- Paste app password (remove spaces)
   ```

4. **Restart backend server**:
   ```bash
   cd backend
   npm run dev
   ```

5. **Test registration again**

---

## Option 2: Use Different Email Service (Alternative)

If you don't want to use Gmail, consider these alternatives:

### Outlook/Hotmail
```env
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

Update `sendemail.js`:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
```

### Mailtrap (for testing only)
Free email testing service: https://mailtrap.io

---

## Testing

After updating credentials:

1. **Check backend logs** - Should see "Email sent successfully"
2. **Check email inbox** - Verification email should arrive within seconds
3. **Click verification link** - Should redirect to login page
4. **Try logging in** - Should work after verification

---

## Troubleshooting

### Still getting authentication errors?
- Make sure app password has **no spaces**
- Try generating a new app password
- Check that SMTP_USER matches the Gmail account that generated the app password

### Email not arriving?
- Check spam/junk folder
- Verify `FRONTEND_URL` is correct in .env
- Check backend logs for errors

### Need help?
The error message shows: `quickfile97@gmail.com`
Make sure you're generating the app password from **this exact Gmail account**.
