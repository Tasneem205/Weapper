const getNextDay = (date) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

export default getNextDay;