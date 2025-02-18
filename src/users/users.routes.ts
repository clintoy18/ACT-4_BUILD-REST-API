import express, { Request, Response} from "express"
import { UnitUser , User } from "./user.interface"
import { StatusCodes } from "http-status-codes"
import * as database from "./user.database" 

export const userRouter = express.Router()


userRouter.get("/users", async (_req : Request, res : Response) => {
    try {
        const allUsers : UnitUser[] = await database.findAll()

        if(!allUsers){
           return res.status(StatusCodes.NOT_FOUND).json({msg: `No users at this time...`})
        }

        return res.status(StatusCodes.OK).json({tolal_users: allUsers.length, allUsers})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})


userRouter.get("/user/:id", async (req : Request, res: Response) => {
   try{
    const user : UnitUser = await database.findOne(req.params.id)

    if(!user){
        return res.status(StatusCodes.NOT_FOUND).json({msg: "`No users at this time...`"})
    }

    return res.status(StatusCodes.OK).json({user})
   }catch(error){   
   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
   }

})


userRouter.post("/register", async (req: Request, res: Response) => {
    try{
        const { username, email, password } = req.body 
        
        if(!username || !email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({msg: `Please fill all fields`})
        }

        const user = await database.findByEmail(email)

        if(user){
            return res.status(StatusCodes.BAD_REQUEST).json({msg: "`Email already exist`"})
        }

        const newUser = await database.create(req.body)

        return res.status(StatusCodes.CREATED).json({newUser})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }



})

userRouter.post("/login", async (req: Request, res: Response) => {
    try{
        const {email, password} = req.body
        
        if(!email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({msg: `Please fill all fields`})
        }

        const user = await database.findByEmail(email)

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `Email not found`})
        }
        
        const comparePassword = await database.comparePassword(password, password)

        if(!comparePassword){
            return res.status(StatusCodes.BAD_REQUEST).json({msg: `Invalid password`})
        }

        return res.status(StatusCodes.OK).json({user})
        
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
        
})

userRouter.put('/user.:id', async (req: Request, res: Response) => {
    try{
        const {username,email,password } = req.params

        const getUser = await database.findOne(req.params.id)

        if(!username || !email || !password){
            return res.status(401).json({error: `Please fill all fields`})
        }

        if(!getUser){
            return res.status(401).json({error: `No user with id ${req.params.id}`})
        }

        const updateUser = await database.update(req.params.id, req.body)

        return res.status(404).json({updateUser})
    }catch(error){
        return res.status(500).json({error})
    }    
})

userRouter.delete("/user/:id", async (req: Request, res: Response) => {

    try{
        const id = (req.params.id)

        const user = await database.findOne(id)

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({error: `User does not exist`})
    }

    await database.remove(id)

    return res.status(StatusCodes.OK).json({msg: `User with id ${id} has been deleted`})

    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})