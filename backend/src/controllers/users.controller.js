import {register} from "../service/auth.service.js"
export const  registerController = async (req, res) =>{
    const {name,email, password, role} = req.body;
    
    try {
       
      const user = await register({name,email, password, role});
      res.status(200).json({message: "Register Success!",data: user})
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}