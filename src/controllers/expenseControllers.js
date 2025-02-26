const expense = require('../models/expense');
const user = require('../models/user');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');

exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

function uploadToS3(data, fileName) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET_KEY = process.env.IAM_USER_SECRET_KEY;

    const s3 = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET_KEY,
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read',  // Optional: If you want the file to be publicly accessible
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, s3Response) => {
            if (err) {
                console.error('Something went wrong:', err);
                reject(err);
            } else {
                console.log("Upload successful:", s3Response.Location);
                resolve(s3Response.Location);
            }
        });
    });
}

exports.getExpenseFile = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = req.user.id;
        const fileName = `Expense_${userId}_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
        // const fileName = 'Expense.txt';

        // Wait for S3 upload to complete and get the file URL
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);

        res.status(200).json({ fileUrl, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body;
    const t = await sequelize.transaction();

    try {
        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = currUser.totalAmount + amount;
        await currUser.update({ totalAmount }, { transaction: t });

        const result = await expense.create({
            description,
            amount,
            category,
            UserId: req.user.id
        }, { transaction: t });

        await t.commit();
        res.status(201).json(result);
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

exports.deleteExpense = async (req, res, next) => {
    const { expenseId } = req.params;
    if (!expenseId) return res.status(400).json({ message: 'expenseId is required' });

    const t = await sequelize.transaction();

    try {
        const currExpense = await expense.findByPk(expenseId, { transaction: t });
        if (!currExpense) return res.status(404).json({ message: 'Expense not found' });

        if (currExpense.UserId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = currUser.totalAmount - currExpense.amount;
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

exports.editExpense = async (req, res, next) => {
    const { editId } = req.params;
    const { description, amount, category } = req.body;
    if (!editId) return res.status(400).json({ message: 'editId is required' });

    const t = await sequelize.transaction();

    try {
        const currExpense = await expense.findByPk(editId, { transaction: t });
        if (!currExpense) return res.status(404).json({ message: 'Expense not found' });

        if (currExpense.UserId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = currUser.totalAmount - currExpense.amount + amount;
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.update({ description, amount, category }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense updated successfully', expense: currExpense });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};
