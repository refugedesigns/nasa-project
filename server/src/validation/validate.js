const { check, validationResult } = require("express-validator")

const validateLaunches = [
    check("mission", 'invalid mission name!').notEmpty().isString(),
    check("rocket", 'invalid rocket name!').notEmpty().isString(),
    check("launchDate", 'invalid launch date!').notEmpty(),
    check("target", 'invalid target!').notEmpty(), 
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        }
        next()
    }
]

module.exports = {
    validateLaunches
}