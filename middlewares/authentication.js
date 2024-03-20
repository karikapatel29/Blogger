const { validateToken } = require("../services/authentication")

// for checking whether user is authenticated
function checkForAuthenticationCookie(cookiename) {
    return (req, res, next) => {
        const tokenCookie = req.cookies[cookiename]
        if (!tokenCookie) {
            return next();
        }
        try {
            const userPayload = validateToken(tokenCookie);
            req.user = userPayload;
        } catch (error) { }

        return next();
    }
}

module.exports = { checkForAuthenticationCookie }