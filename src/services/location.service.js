import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import responses from '../helper/responses.js';
import locationAndMetricSchema from '../schemas/locations.schema.js'
import { MongoClient } from 'mongodb';


const getWeatherByLocation = async (req, res) => {
    try {
        const { error, value } = locationAndMetricSchema.validate(req.params);
        if (error) return responses.badRequest(res, "validaiton error");
        console.log(value);
        const { location, unit } = value;
        
        // Check cache in Redis
        const cachedWeather = await redisClient.get(`${location}:${unit}`);
        if (cachedWeather) {
            console.log('Cache hit!');
            const weatherData = JSON.parse(cachedWeather);
            return responses.success(res, "Weather fetched successfully", weatherData);
        }
        console.log('Cache miss! Fetching from Visual Crossing API...');
        const APIresponse = await axios.get(
            `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}`,
            {
                params: {
                    key: process.env.VISUAL_CROSSING_API_KEY,
                    unitGroup: unit === 'metric' ? 'metric' : 'us',
                },
            }
        );
        if (!APIresponse) return responses.notFound(res, "Data not found");
        const weatherData = APIresponse.data;
        const data = {
            location: weatherData.address,
            temperature: weatherData.currentConditions.temp,
            condition: weatherData.currentConditions.conditions,
            humidity: weatherData.currentConditions.humidity,
            wind_speed: weatherData.currentConditions.windspeed,
            unit,
            timestamp: new Date().toISOString(),
        };
        // save to cache
        await redisClient.setEx(`${location}:${unit}`, 3600, JSON.stringify(data));
        return responses.success(res, "Weather fetched successfully", data);
        
    } catch (error) {
        console.log(`Faild somehow look \n ${error}`);
        return responses.internalServerError(res);
    }
};

const saveLocation = async (req, res) => {
    try {
        console.log(req.params);
        const {error, value} = locationAndMetricSchema.validate(req.params);
        if (error) return responses.badRequest(res, `validaiton error: ${error}`);
        const { location, unit } = value;
        const { user_id } = req.body;
        if (!user_id)
            return responses.badRequest(res, "user_id is required.");

        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        if (!client) return responses.internalServerError(res);
        console.log('Connected successfully to MongoDB server');
        const db = client.db(process.env.DBName);
        const userCollection = db.collection('users');
        let user = await userCollection.findOne({ user_id });
        if (user) {
            // save to this user
            if (user.locations.includes(location))
                return responses.success(res, "Location already saved", user);
            await userCollection.updateOne(
                { user_id },
                { $push: { locations: location } }
            );
            return responses.success(res, "Location saved successfully", user);
        } 
        // create a new user and save
        await userCollection.insertOne({
            user_id,
            locations: [location],
            units: [unit],
        });
        return responses.success(res, "Location and user saved successfully", user);
    } catch (error) {
        console.log(`Faild saving location look \n${error}`);
        return responses.internalServerError(res);
    } finally {
        await client.close();
    }
}

const getSavedLocations = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(`Faild getting saved locations look \n${error}`);
        return responses.internalServerError(res);
    }
}

const locationFunctions = {
    getWeatherByLocation,
    saveLocation,
};

export default locationFunctions;
/*
router.get("/locations/saved", () => {});

*/