import { Product, UnitProduct, Products } from "./product.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import fs from "fs"


let products : Products = loadProducts()


function loadProducts() : Products {
  try {
    const data = fs.readFileSync("./products.json", "utf-8")
    return JSON.parse(data)
  }catch (error){
    console.log(`Error ${error}`)
    return {}
  }
}

function saveProducts() {
    try{
        fs.writeFileSync("./products.json", JSON.stringify(products), "utf-8")
        console.log(`Products saved successfully!`)
    } catch (error){
        console.log(`Error :${error}`)
    }
}

export const findAll = async (): Promise<UnitProduct[]> => Object.values(products);

export const findOne = async (id : string) : Promise<UnitProduct > => products[id];

export const create = async (productData : UnitProduct) : Promise<UnitProduct | null> =>{

    let id = random()

    let check_product = await findOne(id);

    while(check_product){
        id = random()
        check_product =  await findOne(id)
    }
    
    const product : UnitProduct = {
        id : id,
        name : productData.name,
        price : productData.price,
        quantity :productData.quantity,
        image :productData.image
    };

    products[id] = product;

    saveProducts()

    return product;

}

export const update = async (id: string, updateValues : Product) : Promise<UnitProduct | null> => {

    const product = await findOne(id);

    if(!product){
        return null
    }
    
    products[id] = {
        id,
        ...updateValues
    }

    saveProducts()

    return products[id]
}


export const remove = async(id : string) : Promise<null | void> => {

    const product = await findOne(id);

    if(!product){
        return null
    }

    delete products[id]
    
    saveProducts()
}