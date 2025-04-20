// This file contains utility functions for making API calls, such as fetching comments or FAQs.

const apiUrl = "https://script.google.com/macros/s/AKfycbwJlQ2f7hiFFoCxjKWJxgbrq4pt0822r5Iteqi5tOXFryvcLgN7BfXYeFOlJji08ap6FA/exec";

export const fetchComments = async () => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

export const postComment = async (username, comment) => {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, comment })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error posting comment:", error);
        throw error;
    }
};

export const fetchFAQs = async () => {
    try {
        const response = await fetch('faq.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        throw error;
    }
};