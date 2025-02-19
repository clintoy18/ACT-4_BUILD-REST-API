import express, {Request,Response} from "express"
import {Product, UnitProduct} from "./product.interface"
import * as database from "./product.database"
import {StatusCodes} from "http-status-codes"

export const productRouter = express.Router()

//finds all the products in the file storage and returns

productRouter.get("/products", async (req: Request,res : Response):Promise<any> =>{
    try{
        const allProducts = await database.findAll()

        if(!allProducts){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `No products found at this time...`})
        }
        return res.status(StatusCodes.OK).json({totalProducts: allProducts.length, allProducts})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})