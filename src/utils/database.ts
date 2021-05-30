import { Client } from 'pg';

// function to establish database connection 
export const connect = async (con: Client) => {
    try {
        await con.connect();
        console.log('Connected to database!')
    } catch (err) {
        throw err;
    }
}
