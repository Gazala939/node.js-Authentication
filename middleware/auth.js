//  Purpose of this file (in one line):

// This middleware checks if a user is logged in by verifying a JWT token before allowing access to protected routes.

//1️⃣ Importing jsonwebtoken
import jwt from 'jsonwebtoken'

// 2️⃣ JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET  || 'mySuperSecretKey';

// 3️⃣ Middleware function
export const authenticate = (req,res,next) =>{

    // 4️⃣ Reading Authorization Header
    console.log("headers = ", req.headers.authorization);

    // 5️⃣ Extracting Token from Header
    let token = req.headers.authorization?.split(' ')[1];
       
    //6️⃣ Fallback: Token from Cookies
    if(!token && req.cookies){
        token = req.cookies.token
    }

    // 7️⃣ No Token → Block Access
    if(!token){
        return res.status(401).send("Unauthorized - no token")
    }

    try{
        const decode = jwt.verify(token, JWT_SECRET );  // 8️⃣ Verify Token
        req.userId = decode.id;              // 9️⃣ Attach User ID to Request
        console.log("User id = ", decode.id);
        return next();          // 🔟 Continue to Protected Route
    }catch(err){                         //Handle Invalid / Expired Token
        return res.status(404).send('Unauthorized - Invalid token or expired token');
    }
}