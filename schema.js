const Joi = require("joi");

module.exports.visitorSchema = Joi.object({
  visitor: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Email must be valid",
    }),
    mobile: Joi.string()
      .pattern(/^(\+91)?[6-9]\d{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile must be 10 digits",
        "any.required": "Mobile is required",
      }),
    dob: Joi.date().required().messages({
      "any.required": "Date of birth is required",
    }),
    startDate: Joi.date().required().messages({
      "any.required": "Start date is required",
    }),
    endDate: Joi.date().required().messages({
      "any.required": "End date is required",
    }),
    purpose: Joi.string().required().messages({
      "any.required": "Purpose is required",
    }),
    approver: Joi.string().required().messages({
      "any.required": "Approver is required",
    }),
  }).required(),
});
