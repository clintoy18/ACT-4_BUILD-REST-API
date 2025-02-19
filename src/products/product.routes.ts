import express, {Request,Response} from "express"
import {Product, UnitProduct} from "./product.interface"
import * as database from "./product.database"
import {StatusCodes} from "http-status-codes"

export const productRouter = express.Router()

productRouter.get("/products", async (req: Request,res : Response) =>{
    try{
        const allProducts = await database.findAll()

        if(!allProducts){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `No products found at this time...`})
        }
    }
})