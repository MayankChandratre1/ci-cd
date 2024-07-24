"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"

const createOnRamTransaction = async ({amount, provider}:{
    amount:number,
    provider:string
})=>{
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if(!userId){
        return {
            message:"User not found"
        }
    }
    
    await prisma.onRampTransaction.create({
        data:{
            token: (Math.floor(Math.random()*1000)+1000).toString(),
            amount: amount,
            provider: provider,
            userId: Number(userId),
            startTime: new Date(),
            status: "Processing"
        }
    })

    return {
        message: "OnRampTransaction Added"
    }
}


export default createOnRamTransaction