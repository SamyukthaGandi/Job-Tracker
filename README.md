# JobTrack Application - Complete Setup Guide

A comprehensive, step-by-step guide to set up and run JobTrack Pro on your local machine

---

## 📋 Table of Contents

1. [What You'll Need](#what-youll-need)
2. [Step 1: Install Node.js](#step-1-install-nodejs)
3. [Step 2: Download the Project](#step-2-download-the-project)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Run the Application](#step-4-run-the-application)
6. [Step 5: Install Chrome Extension](#step-5-install-chrome-extension)
7. [Using the Application](#using-the-application)
8. [Troubleshooting](#troubleshooting)

---

## What You'll Need

Before starting, make sure you have:

- ✅ A **Windows, Mac, or Linux** computer
- ✅ **Google Chrome** browser installed
- ✅ **Internet connection** (for initial download)
- ✅ About **30 minutes** of free time

---

## Step 1: Install Node.js

Node.js is a tool that runs the application. Follow the instructions for your operating system:

### For Windows:

1. Open your web browser and go to: **https://nodejs.org**
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Download the **Windows Installer (.msi)**
4. Once downloaded, **double-click** the file
5. Click **"Next"** through the installation wizard
6. Click **"Finish"** when done

**To verify it's installed:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type: `node --version`
4. You should see something like: `v20.11.0`

### For Mac:

1. Open your web browser and go to: **https://nodejs.org**
2. Click the big green button that says **"LTS"**
3. Download the **macOS Installer (.pkg)**
4. Once downloaded, **double-click** the file
5. Follow the installation wizard
6. Click **"Close"** when done

**To verify it's installed:**
1. Open **Terminal** (press `Cmd + Space`, type "Terminal", press Enter)
2. Type: `node --version`
3. You should see something like: `v20.11.0`

### For Linux (Ubuntu/Debian):

1. Open **Terminal**
2. Copy and paste these commands one at a time:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. To verify, type: `node --version`
4. You should see something like: `v20.11.0`

---

## Step 2: Download the Project

### Option A: Download as ZIP (Easiest)

1. Go to the project location (wherever the files were shared)
2. Download the **jobtrack-pro.zip** file
3. **Extract** the ZIP file to your Desktop or Documents folder
4. You should now have a folder called **"jobtrack-pro"**

### Option B: Using Git (If you're comfortable with it)

1. Open Terminal/Command Prompt
2. Navigate to where you want the project:
   ```bash
   cd Desktop
   ```
3. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

---

## Step 3: Install Dependencies

Dependencies are additional tools the application needs to run.

### For Windows:

1. Navigate to the project folder:
   - Open **File Explorer**
   - Go to where you extracted the ZIP file
   - Click on the **"jobtrack-pro"** folder
   - Click on the **"app"** folder inside it
   
2. Click in the address bar at the top
3. Type `cmd` and press Enter
4. A black window (Command Prompt) will open

5. Type this command and press Enter:
   ```bash
   npm install
   ```

6. Wait for it to finish (this may take 2-5 minutes)
7. You'll see a lot of text scrolling by - this is normal!
8. When you see the prompt again, it's done

### For Mac/Linux:

1. Open **Terminal**
2. Navigate to the project folder:
   ```bash
   cd ~/Desktop/jobtrack-pro/app
   ```
   (Adjust the path if you put it somewhere else)

3. Type this command and press Enter:
   ```bash
   npm install
   ```

4. Wait for it to finish (this may take 2-5 minutes)
5. When you see the prompt again, it's done

---

## Step 4: Run the Application

Now let's start the application!

### Start the Development Server:

1. Make sure you're still in the project folder (the `app` folder)
2. In the same terminal/command window, type:
   ```bash
   npm run dev
   ```

3. You'll see something like:
   ```
   VITE v7.3.0  ready in 245 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ➜  press h + enter to show help
   ```

4. **Open your browser** and go to: **http://localhost:5173/**

5. The application should now be running! 🎉

### To Stop the Application:

- Press `Ctrl + C` in the terminal window
- Or simply close the terminal window

### To Start Again Later:

1. Open Terminal/Command Prompt
2. Navigate to the app folder
3. Run: `npm run dev`

---
## Using the Application

### First Time Setup

1. **Create an account:**
   - Click "Sign Up"
   - Enter your email and name
   - Create a password
   - Click "Create Account"

2. **Add your first resume:**
   - Go to **"Resume Manager"** in the sidebar
   - Click **"Add Resume"**
   - Give it a name (e.g., "Software Engineer v1")
   - Paste your resume content or upload a file
   - Click "Add Resume"

3. **Set a default resume:**
   - Click on your resume
   - Click **"Set as Default"**


### Tracking Job Applications

1. Go to **"Application Tracker"** in the sidebar
2. Click **"Add Application"** to manually add a job
3. Drag cards between columns to update status
4. Click on any application to:
   - View the resume used
   - Download the resume
   - Download the cover letter
   - See interview history


---

## Troubleshooting

### Problem: "npm install" fails

**Solution:**
1. Make sure Node.js is installed correctly
2. Try running: `npm cache clean --force`
3. Then try `npm install` again

### Problem: "npm run dev" shows an error

**Solution:**
1. Make sure you're in the correct folder (the `app` folder)
2. Try deleting the `node_modules` folder and running `npm install` again
3. Check that port 5173 is not being used by another program

### Problem: Chrome extension won't load

**Solution:**
1. Make sure "Developer mode" is turned ON
2. Make sure you selected the correct folder (the `extension` folder, not the whole project)
3. Try refreshing the extensions page (`chrome://extensions/`)

### Problem: Changes not showing up

**Solution:**
1. The app should automatically refresh when you make changes
2. If not, press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac) to hard refresh

### Problem: Can't find my saved data

**Solution:**
- All data is saved in your browser's local storage
- If you clear browser data, your applications will be lost
- Use the **Export Data** feature in Settings to backup regularly

---

## Building for Production (Optional)

If you want to deploy the application to a web server:

1. In the terminal, run:
   ```bash
   npm run build
   ```

2. This creates a `dist` folder with all the files needed for deployment

3. Upload the contents of the `dist` folder to your web server

---

## Getting Help

If you run into any issues:

1. Check the **Troubleshooting** section above
2. Make sure you followed each step exactly
3. Try restarting from Step 3 (npm install)

---

## Summary of Commands

Here's a quick reference of all the commands you'll need:

```bash
# Navigate to project
cd jobtrack-pro/app

# Install dependencies (do this once)
npm install

# Run the application
npm run dev

# Build for production
npm run build
```

---

## 🎉 You're All Set!

You now have JobTrack Pro running locally on your machine! 

**Key Features Available:**
- ✅ ATS Resume Analyzer
- ✅ AI Resume & Cover Letter Generator (based on YOUR resume)
- ✅ Job Application Tracker with Kanban board
- ✅ Resume Manager with versioning
- ✅ Analytics Dashboard
- ✅ Chrome Extension for auto-filling applications
- ✅ Per-job resume tracking and download


