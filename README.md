# 🏋️ Click Fit - Full Stack Developer Test (On Wave Group)

## 📌 Introduction
Click Fit is a **sports and fitness** web application built as a technical test for the **Full Stack Developer** position at **On Wave Group**.  
The project includes **user authentication**, **image upload functionality**, and a **MySQL database with stored procedures**.

### **✔ Key Features**
- 🎨 **Responsive frontend** using **Bootstrap, jQuery, CSS animations**
- 🔗 **AJAX API request** to fetch a random fact from **Numbers API**
- 🖼️ **Drag & Drop image upload functionality**
- 🔐 **JWT-based authentication** (configured in `.env` file)
- 🛢️ **MySQL database with a stored procedure `addUser`**
- 📂 **Local image storage (No cloud services used)**

---

## 🚀 Installation & Setup

### **1️⃣ Prerequisites**
- **Node.js** (`>= v14`)
- **MySQL** installed and running

### **2️⃣ Extract the Project**
Once you receive the ZIP file, extract it to your preferred location:
```bash
unzip click-fit.zip
cd click-fit
```

### **3️⃣ Environment Configuration**
The JWT configuration is stored in the `.env` file. Ensure that the correct values are set before running the project.

### **4️⃣ Database Configuration**
The database connection is configured in `db.js`, using the following details:
```js
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "your_database",
    port: 3306 
});
```
⚠️ **Make sure the MySQL server is running on the correct port.**

### **5️⃣ Database Setup**
Import the `database.sql` file into MySQL:
```sql
source database.sql;
```
This will create:
- The database `clickfit_db`
- The `users` table
- The stored procedure `addUser`

### **6️⃣ Start the Backend**
Run the backend server:
```bash
cd backend
node server.js
```
The API will be available at **`http://localhost:3000`**

### **7️⃣ Start the Frontend**
Run the frontend using a static server:
```bash
cd frontend
npx serve
```
After running this command, click on the **provided local link in the terminal** to open the frontend.

---

## 🖥️ **Features Overview**
### **Frontend**
✔ Responsive UI with Bootstrap + jQuery  
✔ Smooth animations (fade-in, ripple, slide-in)  
✔ "Fact of the Day" section fetching data from **Numbers API**  
✔ Drag & drop image upload functionality  

### **Backend**
✔ JWT Authentication: **Signup, Login, Protected Routes** (configured in `.env`)  
✔ Secure image upload stored in **`upload_images/`**  
✔ MySQL database integration with stored procedure `addUser` (DB configured in `db.js`)  

---

## 🔗 **API Endpoints**
### 🔹 `POST /register` - User Registration
**Request Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "securepassword",
  "type": "user"
}
```
✅ Password is **hashed** using **bcrypt**  
✅ Calls the stored procedure `addUser`

---

### 🔹 `POST /login` - User Login
**Request Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "securepassword"
}
```
✅ Validates user credentials and returns a **JWT Token**

---

### 🔹 `POST /upload` - Image Upload
📌 **Required Headers:**
```json
{ "Authorization": "Bearer JWT_TOKEN" }
```
📌 **Body:** `multipart/form-data` with an **image** field  

✅ Stores the image inside **`upload_images/`**  
✅ Returns the URL of the uploaded file  

---

## 📷 **Successful Image Upload Example**
![Screenshot](images/screenshot-upload.png)
