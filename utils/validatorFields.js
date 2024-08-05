const { body, validationResult } = require('express-validator');

async function validateRegisterOwnerFields(req) {
    try {
        // Validation of email
        await body('email')
            .isEmail().withMessage('The email address is required and must be valid')
            .matches(/^.+@.+\..+$/).withMessage('The email address is invalid, the "@" is missing').run(req);

        // Validation of name
        await body('name').notEmpty().withMessage('Name is required').run(req);

        // Validation of lastName
        await body('lastName').notEmpty().withMessage('Last name is required').run(req);

        // Validation of password
        await body('password').isLength({ min: 8 }).withMessage('Password is required and must be at least 8 characters long').run(req);
        await body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number').run(req);

        // Validation of phone number
        await body('phone')
            .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits long')
            .run(req);

        // Validation of address fields
        await body('address.street').notEmpty().withMessage('Street address is required').run(req);
        await body('address.city').notEmpty().withMessage('City is required').run(req);
        await body('address.province').notEmpty().withMessage('Province is required').run(req);
        await body('address.postalCode').notEmpty().withMessage('Postal code is required').run(req);
        await body('address.apartment').optional().run(req); // If apartment is not always required

        // Validation of company name
        await body('companyName').notEmpty().withMessage('Company name is required').run(req);

    } catch (error) {
        // Handle validation errors here
        console.log("Field validation error");
    }
}

async function validateUpdateOwnerFields(req) {
    try {
        if(req.body.email) {
            await body('email')
            .isEmail().withMessage('The email address is required and must be valid')
            .matches(/^.+@.+\..+$/).withMessage('The email address is invalid, the "@" is missing').run(req);
        }
        if(req.body.name) {
            await body('name').notEmpty().withMessage('Name is required').run(req);
        }
        if(req.body.lastName) {
            await body('lastName').notEmpty().withMessage('Last name is required').run(req);
        }
        if(req.body.password) {
            await body('password').isLength({ min: 8 }).withMessage('Password is required and must be at least 8 characters long').run(req);
            await body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number').run(req);
        }
        if(req.body.phone) {
            await body('phone')
            .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits long')
            .run(req);
        }
        if(req.body.address) {
            if(req.body.address.street) {
                await body('address.street').notEmpty().withMessage('Street address is required').run(req);
            }
            if(req.body.address.apartment) {
                await body('address.apartment').optional().run(req);
            }
            if(req.body.address.city) {
                await body('address.city').notEmpty().withMessage('City is required').run(req);
            }
            if(req.body.address.province) {
                await body('address.province').notEmpty().withMessage('Province is required').run(req);
            }
            if(req.body.address.postalCode) {
                await body('address.postalCode').notEmpty().withMessage('Postal code is required').run(req);
            }
        }
        if(req.body.companyName) {
            await body('companyName').notEmpty().withMessage('Company name is required').run(req);
        }
    } catch (error) {
        // Handle validation errors here
        console.log("Field validation error");
    }
}

async function validatePropertyFields(req) {
    try {
        // Validation of street
        await body('street')
            .notEmpty().withMessage('Street address is required')
            .isLength({ min: 5 }).withMessage('Street address must be at least 5 characters long')
            .run(req);

        // Validation of city
        await body('city')
            .notEmpty().withMessage('City is required')
            .isLength({ min: 3 }).withMessage('City must be at least 3 characters long')
            .run(req);

        // Validation of province
        await body('province')
            .notEmpty().withMessage('Province is required')
            .isLength({ min: 4 }).withMessage('Province must be at least 4 characters long')
            .run(req);

        // Validation of postalCode
        await body('postalCode')
            .notEmpty().withMessage('Postal code is required')
            .isLength({ min: 5 }).withMessage('Postal code must be at least 5 characters long')
            .run(req);

        // Validation of country
        await body('country')
            .notEmpty().withMessage('Country is required')
            .isLength({ min: 3 }).withMessage('Country must be at least 3 characters long')
            .run(req);

        // Validation of name
        await body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
            .run(req);

        // Validation of type
        await body('type')
            .notEmpty().withMessage('Type is required')
            .isIn(['Commercial', 'Residential']).withMessage('Type must be either "Commercial" or "Residential"')
            .run(req);

        // Validation of description (optional, with minimum length)
        await body('description')
            .optional()
            .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long')
            .run(req);

    } catch (error) {
        // Handle validation errors here
        console.log("Field validation error", error);
    }
}

async function validatePropertyUpdateFields01(req) {
    try {
        // Validation of street (if provided)
        if (req.body.street !== undefined) {
            await body('street')
                .notEmpty().withMessage('Street address cannot be empty if provided')
                .isLength({ min: 5 }).withMessage('Street address must be at least 5 characters long')
                .run(req);
        }

        // Validation of city (if provided)
        if (req.body.city !== undefined) {
            await body('city')
                .notEmpty().withMessage('City cannot be empty if provided')
                .isLength({ min: 3 }).withMessage('City must be at least 3 characters long')
                .run(req);
        }

        // Validation of province (if provided)
        if (req.body.province !== undefined) {
            await body('province')
                .notEmpty().withMessage('Province cannot be empty if provided')
                .isLength({ min: 4 }).withMessage('Province must be at least 4 characters long')
                .run(req);
        }

        // Validation of postalCode (if provided)
        if (req.body.postalCode !== undefined) {
            await body('postalCode')
                .notEmpty().withMessage('Postal code cannot be empty if provided')
                .isLength({ min: 5 }).withMessage('Postal code must be at least 5 characters long')
                .run(req);
        }

        // Validation of country (if provided)
        if (req.body.country !== undefined) {
            await body('country')
                .notEmpty().withMessage('Country cannot be empty if provided')
                .isLength({ min: 3 }).withMessage('Country must be at least 3 characters long')
                .run(req);
        }

        // Validation of name (if provided)
        if (req.body.name !== undefined) {
            await body('name')
                .notEmpty().withMessage('Name cannot be empty if provided')
                .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
                .run(req);
        }

        // Validation of type (if provided)
        if (req.body.type !== undefined) {
            await body('type')
                .notEmpty().withMessage('Type cannot be empty if provided')
                .isIn(['Commercial', 'Residential']).withMessage('Type must be either "Commercial" or "Residential"')
                .run(req);
        }

        // Validation of description (if provided)
        if (req.body.description !== undefined) {
            await body('description')
                .optional()
                .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long')
                .run(req);
        }

    } catch (error) {
        // Handle validation errors here
        console.error("Field validation error", error);
    }
}

async function validatePropertyUpdateFields(req) {
    try {
        const { street, postalCode, city, province, country, name, type, description } = req.body;

        // Check if street or postalCode is provided to handle their interdependency
        const isStreetProvided = street !== undefined;
        const isPostalCodeProvided = postalCode !== undefined;

        // Validate street if provided
        if (isStreetProvided) {
            await body('street')
                // .notEmpty().withMessage('Street address cannot be empty if provided')
                .optional()
                .isLength({ min: 5 }).withMessage('Street address must be at least 5 characters long')
                .run(req);
        }

        // Validate postalCode if provided
        if (isPostalCodeProvided) {
            await body('postalCode')
                // .notEmpty().withMessage('Postal code cannot be empty if provided')
                .optional()
                .isLength({ min: 5 }).withMessage('Postal code must be at least 5 characters long')
                .run(req);
        }

        // If street is provided, ensure postalCode is also provided
        if (isStreetProvided && !isPostalCodeProvided) {
            await body('postalCode')
                .notEmpty().withMessage('Postal code is required if street is updated')
                .isLength({ min: 5 }).withMessage('Postal code must be at least 5 characters long')
                .run(req);
        }

        // If postalCode is provided, ensure street is also provided
        if (isPostalCodeProvided && !isStreetProvided) {
            await body('street')
                .notEmpty().withMessage('Street address is required if postal code is updated')
                .isLength({ min: 5 }).withMessage('Street address must be at least 5 characters long')
                .run(req);
        }

        // Validate city (if provided)
        if (city !== undefined) {
            await body('city')
                // .notEmpty().withMessage('City cannot be empty if provided')
                .optional()
                .isLength({ min: 3 }).withMessage('City must be at least 3 characters long')
                .run(req);
        }

        // Validate province (if provided)
        if (province !== undefined) {
            await body('province')
                // .notEmpty().withMessage('Province cannot be empty if provided')
                .optional()
                .isLength({ min: 4 }).withMessage('Province must be at least 4 characters long')
                .run(req);
        }

        // Validate country (if provided)
        if (country !== undefined) {
            await body('country')
                // .notEmpty().withMessage('Country cannot be empty if provided')
                .optional()
                .isLength({ min: 3 }).withMessage('Country must be at least 3 characters long')
                .run(req);
        }

        // Validate name (if provided)
        if (name !== undefined) {
            await body('name')
                // .notEmpty().withMessage('Name cannot be empty if provided')
                .optional()
                .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
                .run(req);
        }

        // Validate type (if provided)
        if (type !== undefined) {
            await body('type')
                // .notEmpty().withMessage('Type cannot be empty if provided')
                .optional()
                .isIn(['Commercial', 'Residential']).withMessage('Type must be either "Commercial" or "Residential"')
                .run(req);
        }

        // Validate description (if provided)
        if (description !== undefined) {
            await body('description')
                .optional()
                .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long')
                .run(req);
        }

    } catch (error) {
        console.error("Field validation error", error);
    }
}



module.exports = {
    validateRegisterOwnerFields,
    validateUpdateOwnerFields,
    validatePropertyFields,
    validatePropertyUpdateFields
    
};