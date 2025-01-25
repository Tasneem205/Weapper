import responses from "../helper/responses.js";
import userSchema from "../schemas/user.schema.js";
import settingSchema from "../schemas/setting.schema.js";
import { MongoClient } from 'mongodb';

const getSettings = async (req, res) => {
    const client = new MongoClient(process.env.URI);
    try {
        const { error, value: {user_id} } = userSchema.validate(req.params);
        if (error) return responses.badRequest(res, `validaiton error: ${error}`);
        await client.connect();
        if (!client) return responses.internalServerError(res);
        console.log('Connected successfully to MongoDB server');
        const db = client.db(process.env.DBName);
        const userCollection = db.collection('users');
        let user = await userCollection.findOne({ user_id });
        if (!user) return responses.notFound(res, "User not found or no settings saved");
        return responses.success(res, "User settings fetched successfully", user);
    } catch (error) {
        console.log(`Faild getting saved settings look \n${error}`);
        return responses.internalServerError(res);
    } finally {
        await client.close();
        console.log('Connection to MongoDB server closed');
    }
};

const postSettings = async (req, res) => {
    const client = new MongoClient(process.env.URI);
    try {
        // Validate request params
        const { error1, value: { user_id } } = userSchema.validate(req.params);
        if (error1) return responses.badRequest(res, `Validation error: ${error1}`);
        // Validate request body
        const { error2, value } = userSchema.validate(req.body);
        if (error2) return responses.badRequest(res, `Validation error: ${error2}`);
        
        const { theme, notifications } = value;
        await client.connect();
        if (!client) return responses.internalServerError(res);
        console.log('Connected successfully to MongoDB server');
        const db = client.db(process.env.DBName);
        const userCollection = db.collection('users');

        // Find the user by user_id
        let user = await userCollection.findOne({ user_id });
        if (user) {
            // If user exists, update their settings
            if (theme) {
                await userCollection.updateOne(
                    { user_id },
                    { $set: { settings: { theme} } }
                );
            }
            if (notifications) {
                await userCollection.updateOne(
                    { user_id },
                    { $set: { settings: { notifications } } }
                );
            }
            return responses.success(res, "Settings updated successfully", user);
        } 

        // If user doesn't exist, create a new user with the settings
        await userCollection.insertOne({
            user_id,
            settings: { theme, notifications },
        });
        return responses.success(res, "User and settings saved successfully", { user_id, theme, notifications });
    } catch (error) {
        console.log(`Failed saving settings: \n${error}`);
        return responses.internalServerError(res);
    } finally {
        await client.close();
        console.log('Connection to MongoDB server closed');
    }
};

const settingServices = {
    getSettings,
    postSettings,
};

export default settingServices;
