import {login} from '../service/auth.service.js';


export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try{
        const tokens = await login(email, password);
        res.status(200).json({ tokens });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
