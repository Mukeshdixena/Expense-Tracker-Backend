const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = "TEST430329ae80e0f32e41a393d78b923034";
Cashfree.XClientSecret = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


let orderId;
exports.createOrder = (req, res, next) => {
    orderId = `order_${Date.now()}`;
    var request = {
        "order_amount": 1.00,
        "order_currency": "INR",
        "order_id": orderId,
        "customer_details": {
            "customer_id": "devstudio_user",
            "customer_phone": "8474090589"
        },
        "order_meta": {
            "return_url": `http://localhost:3000/payment/paymentStatus/${orderId}`,
            "notify_url": "https://www.cashfree.com/devstudio/preview/pg/webhooks/97521047",
            "payment_methods": "cc,dc,upi"
        },
        "order_expiry_time": "2025-02-19T08:13:42.686Z"
    };

    Cashfree.PGCreateOrder("2023-08-01", request).then((response) => {
        // console.log('Order created successfully:', response.data);
        res.status(201).json(response.data.payment_session_id);
        // return response.data;
    }).catch((error) => {
        res.status(500).json(error);
    });
}
exports.paymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params; // Get orderId from query string

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Assuming Cashfree.PGOrderFetchPayments is an async function
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        // console.log(response);
        res.status(200).json({
            orderId: orderId,
            status: response?.status // Adjust the field based on the actual API response
        });

    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// exports.FetchPayments = (req, res, next) => {
//     Cashfree.PGOrderFetchPayments("2023-08-01", orderId).then((response) => {
//         console.log('Order fetched successfully:', response.data);
//     }).catch((error) => {
//         console.error('Error:', error.response.data.message);
//     });
// }

