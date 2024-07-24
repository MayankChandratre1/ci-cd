"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"

const makeP2PTransfer = async (reciever: string, TransferAmount: number)=>{
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if(!userId){
        return {
            message:"User not logged in"
        }
    }

    const userBalance = await prisma.balance.findUnique({
        where:{
            userId: Number(userId)
        },
        select:{
            amount: true
        }
    })

    if(!userBalance || userBalance.amount < TransferAmount){
        
        return {
            message: "Insufficient Balance"
        }
    }

    const recieverId = await prisma.user.findFirst({
        where:{
            number: reciever
        },
        select:{
            id: true
        }
    })

    if(!recieverId || !recieverId.id){
        return {
            message:`User with number ${reciever} not found`
        }
    }


    await prisma.$transaction([
        prisma.balance.update({
            where:{
                userId: Number(userId)
            },
            data:{
                amount: {
                    decrement: TransferAmount
                }
            }
        }),
        prisma.balance.update({
            where:{
                userId: Number(recieverId.id)
            },
            data:{
                amount: {
                    increment: TransferAmount
                }
            }
        }),
    ])

    return JSON.stringify({
        message:"Amount Transferred"
    })
}

export default makeP2PTransfer