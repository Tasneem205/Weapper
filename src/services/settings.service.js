import responses from "../helper/responses.js";
import userSchema from "../schemas/user.schema.js";
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

};

const settingServices = {
    getSettings,
    postSettings,
};

export default settingServices;
