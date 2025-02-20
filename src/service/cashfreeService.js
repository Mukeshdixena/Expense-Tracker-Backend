const { Cashfree } = require("cashfree-pg");
require('dotenv').config();


Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


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
                return_url: `http://127.0.0.1:5500/ExpenceTracker/home.html?orderId=${orderId}`,
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
