import Joi from 'joi';

const historicalSchema = Joi.object({
    start_date: Joi.date()
        .iso()
        .default(() => {
            const now = new Date();
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30); // Subtract 30 days
            return thirtyDaysAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }),
    end_date: Joi.date()
        .iso()
        .default(() => {
            const now = new Date();
            return now.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
        }),
    unit: Joi.string().valid('metric', 'us', 'uk', 'ca').default('metric'),
});

export default historicalSchema;