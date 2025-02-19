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

productRouter.get("/product/:id ", async (req: Request, res : Response): Promise<any> =>{
   try{
    const product = await database.findOne(req.params.id)
    
    if(!product){
        return res.status(StatusCodes.NOT_FOUND).json({msg: `No product with that ID...`}) 
    }
    
    return res.status(StatusCodes.OK).json({product})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

//Create a new product
productRouter.post("/createProduct", async (req: Request, res : Response):Promise<any> => {
    try{
        const {name, price, quantity, image} = req.body

        if(!name || !price || !quantity || !image){
            return res.status(StatusCodes.BAD_REQUEST).json({error: `Please provide required parameters`})
        }
        const newProduct = await database.create({...req.body})        
        return res.status(StatusCodes.CREATED).json({newProduct})
}catch(error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error}
    )
    }
})

//update product data

productRouter.put("/product", async(req: Request, res: Response): Promise<any> => {
     try{
        const id = req.params.id
        
        const newProduct = req.body

        const findProduct = await database.findOne(id)

    if (!findProduct){
        return res.status(StatusCodes.BAD_REQUEST).json({msg: `Product does not exists`})

    }

    const updateProduct = await database.update(id, newProduct)
    return res.status(StatusCodes.OK).json({updateProduct})

     }catch(error){

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
     }
})

productRouter.delete("/delete", async (req: Request, res: Response): Promise<any>=>{
  try{
    const getProduct = await database.findOne(req.params.id)

    if(!getProduct){
      return res.status(StatusCodes.NOT_FOUND).json({error: `Product with id ${req.params.id} does not exists`})
    }

    await database.remove(req.params.id)

    return res.status(StatusCodes.OK).json({msg: `Product deleted`})
  }catch(error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
  }


})



