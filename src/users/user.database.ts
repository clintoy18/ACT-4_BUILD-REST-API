// Import necessary modules
import { User, UnitUser, Users } from "./user.interface"; // Import types/interfaces for users
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { v4 as random } from "uuid"; // Import UUID for generating unique user IDs
import fs from "fs"; // Import filesystem module for reading/writing user data

// Load user data from the "users.json" file
let users: Users = loadUsers();

/**
 * Reads the "users.json" file and returns parsed user data.
 * If the file is missing or empty, it returns an empty object.
 */
function loadUsers(): Users {
    try {
        const data = fs.readFileSync("./users.json", "utf-8"); // Read file content
        return JSON.parse(data); // Convert JSON string to object
    } catch (error) {
        console.log(`Error : ${error}`); // Log error if file reading fails
        return {}; // Return an empty object
    }
}

/**
 * Writes the current `users` object back to "users.json".
 */
function saveUsers() {
    try {
        fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8"); // Save users to file
        console.log(`Users saved successfully!`);
    } catch (error) {
        console.log(`Error : ${error}`); // Log error if saving fails
    }
}

/**
 * Retrieves all users as an array.
 */
export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

/**
 * Finds a user by their ID.
 * @param id - The user ID to look up.
 */
export const findOne = async (id: string): Promise<UnitUser> => users[id];

/**
 * Creates a new user.
 * @param userData - The user details including username, email, and password.
 */
export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
    let id = random(); // Generate a random unique ID

    // Ensure the ID is unique by checking if it already exists
    let check_user = await findOne(id);
    while (check_user) {
        id = random(); // Generate a new ID if the existing one is taken
        check_user = await findOne(id);
    }

    // Generate a salt and hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create a new user object
    const user: UnitUser = {
        id: id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword // Store the hashed password, NOT the plain text password
    };

    users[id] = user; // Save user to the `users` object
    saveUsers(); // Save the updated users object to the file

    return user; // Return the newly created user
};

/**
 * Finds a user by their email.
 * @param user_email - The email to search for.
 */
export const findByEmail = async (user_email: string): Promise<null | UnitUser> => {
    const allUsers = await findAll(); // Retrieve all users
    const getUser = allUsers.find(result => user_email === result.email); // Find user by email

    if (!getUser) {
        return null; // Return null if no user is found
    }

    return getUser; // Return the found user
};

/**
 * Compares the supplied password with the stored hashed password for a given user.
 * @param email - The email of the user trying to log in.
 * @param supplied_password - The password entered by the user.
 */
export const comparePassword = async (email: string, supplied_password: string): Promise<null | UnitUser> => {
    const user = await findByEmail(email); // Find user by email

    if (!user) {
        return null; // Return null if user is not found
    }

    // Compare the supplied password with the stored hashed password
    const decryptPassword = await bcrypt.compare(supplied_password, user.password);

    if (!decryptPassword) {
        return null; // Return null if the password does not match
    }

    return user; // Return the user if authentication is successful
};

/**
 * Updates user information.
 * @param id - The ID of the user to update.
 * @param updateValues - The updated user properties.
 */
export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
    const userExists = await findOne(id); // Check if user exists

    if (!userExists) {
        return null; // Return null if user does not exist
    }

    // If password is being updated, hash the new password before storing
    if (updateValues.password) {
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(updateValues.password, salt);
        updateValues.password = newPass;
    }

    // Merge existing user data with new update values
    users[id] = {
        ...userExists,
        ...updateValues
    };

    saveUsers(); // Save the updated user data to the file

    return users[id]; // Return the updated user
};

/**
 * Deletes a user by ID.
 * @param id - The ID of the user to remove.
 */
export const remove = async (id: string): Promise<null | void> => {
    const user = await findOne(id); // Find user by ID

    if (!user) {
        return null; // Return null if user does not exist
    }

    delete users[id]; // Remove user from the `users` object
    saveUsers(); // Save the updated user data to the file
};
