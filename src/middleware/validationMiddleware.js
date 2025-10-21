const Joi = require('joi');

// Validation schemas
const authValidation = {
    register: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters'
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'string.empty': 'Email is required'
            }),

        password: Joi.string()
            .min(6)
            .max(100)
            .required()
            .messages({
                'string.min': 'Password must be at least 6 characters long',
                'string.empty': 'Password is required'
            })
    }),

    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'string.empty': 'Email is required'
            }),

        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password is required'
            })
    }),

    updateProfile: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long'
            })
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'string.empty': 'Current password is required'
            }),

        newPassword: Joi.string()
            .min(6)
            .max(100)
            .required()
            .messages({
                'string.min': 'New password must be at least 6 characters long',
                'string.empty': 'New password is required'
            })
    })
};

// Validation middleware generator
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errorDetails
            });
        }

        next();
    };
};

module.exports = {
    authValidation,
    validate
};