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


module.exports = {
    validateRegisterOwnerFields,
    validateUpdateOwnerFields
    
};