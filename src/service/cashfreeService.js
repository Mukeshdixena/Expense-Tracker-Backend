const { Cashfree } = require("cashfree-pg");
require('dotenv').config();
const sib = require("sib-api-v3-sdk");
const crypto = require("crypto");
const user = require('../models/user');

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


const client = sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transEmailApi = new sib.TransactionalEmailsApi();

const otpStore = {};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();


exports.createOrder = async (req, res, next) => {
    try {
        const orderId = `order_${Date.now()}`;

        const request = {
            order_amount: 100.00,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: "devstudio_user",
                customer_phone: "8474090589"
            },
            order_meta: {
                return_url: `${process.env.FRONT_END_URL}/ExpenceTracker/ExpenceTracker.html?orderId=${orderId}`,
                notify_url: "https://www.cashfree.com/devstudio/preview/pg/webhooks/97521047",
                payment_methods: "cc,dc,upi"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        res.status(201).json({
            orderId,
            paymentSessionId: response.data.payment_session_id
        });

    } catch (error) {
        console.error("Error creating order:", error.response?.data || error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

exports.paymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        res.status(200).json({
            orderId,
            data: response.data
        });

    } catch (error) {
        console.error("Error fetching payment status:", error.response?.data || error);
        res.status(500).json({ error: "Failed to fetch payment status" });
    }
};
exports.postOtpMail = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ sent: false, message: "Email is required" });
    }

    const currUser = await user.findOne({ email });
    if (!currUser) {
        return res.json({ sent: false, message: 'Email not found' });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const emailData = {
        sender: { email: process.env.EMAIL_SENDER, name: "Your Service" },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    };

    try {
        await transEmailApi.sendTransacEmail(emailData);
        res.json({ sent: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sent: false, message: "Failed to send OTP" });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ result: false, message: "Email and OTP are required", email, otp, otpStore });
    }

    const storedOtp = otpStore[email];
    if (!storedOtp) {
        return res.status(400).json({ result: false, message: "OTP expired or not found", email, otp, otpStore });
    }

    if (storedOtp.otp !== otp) {
        return res.status(400).json({ result: false, message: "Invalid OTP", email, otp, otpStore });
    }

    delete otpStore[email];
    res.json({ result: true, message: "OTP verified successfully", email, otp, otpStore });
};
