# 💸 Expense Tracker App

A full-stack web application built using **Node.js**, **Express**, **Sequelize**, and **MySQL** that helps users track daily expenses, categorize spending, and upgrade to a premium membership for enhanced features.

## 🚀 Features

* 🔐 **Authentication** – User registration and secure login.
* 📝 **Add/Edit/Delete Expenses** – Track expenses by category and description.
* 📊 **Total Expense Summary** – Real-time display of total spending.
* 💳 **Premium Membership** – Integrated with **Cashfree** for payments.
* 📈 **Leader Board** – Compare your expenses with other users.
* 📥 **Download History** – Export your expenses data (premium users).
* 🔁 **Responsive UI** – Clean and user-friendly interface using HTML/CSS and JavaScript.

## 📷 Screenshots

| Login Page                   | Add Expense                     | Payment Gateway                | Premium Dashboard              |
| ---------------------------- | ------------------------------- | ------------------------------ | ------------------------------ |
| ![](./screenshots/login.png) | ![](./screenshots/expenses.png) | ![](./screenshots/payment.png) | ![](./screenshots/premium.png) |

## 🛠️ Tech Stack

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js, Express.js
* **Database**: MySQL with Sequelize ORM
* **Authentication**: JWT-based authentication
* **Payment Gateway**: Cashfree Payments
* **Deployment**: (Add details here - e.g., Render, Railway, Vercel, etc.)

## 📦 Installation

```bash
git clone https://github.com/Mukeshdixena/Expense-Tracker-Backend
cd Expense-Tracker-Backend
npm install
```

Create a `.env` file in the root directory with the following:

```env
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=

BREVO_API_KEY=
EMAIL_SENDER=
BUCKET_NAME=
IAM_USER_KEY=
IAM_USER_SECRET_KEY=
DATABASE_NAME=
DATABASE_PASSWORD=
DATABASE_USER=
PRIVET_KEY=
```

Run the app:

```bash
npx sequelize db:create
npx sequelize db:migrate
npm start
```

## 🧪 Testing

You can test the app using Postman or browser-based UI:

* `POST /user/signup`
* `POST /user/login`
* `POST /expense/add`
* `GET /expense/get`
* `DELETE /expense/delete/:id`
* `GET /purchase/premiummembership`

## 🧠 Challenges Faced

* Payment integration with **Cashfree** SDK.
* Secure JWT token management and role-based access.
* Efficient state updates and frontend performance.

## 📌 Future Enhancements

* Dark mode UI support
* Advanced filtering (by date/category)
* Monthly reports with charts (e.g., Chart.js)

## 🙌 Acknowledgements

* [Cashfree Payments](https://www.cashfree.com/)
* [Sequelize ORM](https://sequelize.org/)
* [Express.js](https://expressjs.com/)

